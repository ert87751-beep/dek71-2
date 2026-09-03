import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Student, EarlyDepartureRecord, ClassScheduleConfig } from '../types';
import { INITIAL_STUDENTS } from '../data/initialData';

const STUDENTS_COLLECTION = 'students_dek71';
const DEPARTURES_COLLECTION = 'departures_dek71';
const SETTINGS_COLLECTION = 'settings_dek71';

// Default schedule config
export const DEFAULT_SCHEDULE_CONFIG: ClassScheduleConfig = {
  defaultDismissalTime: '16:00',
  morningDismissalTime: '12:00',
  periods: [
    { period: 1, name: 'คาบที่ 1', startTime: '08:30', endTime: '09:20' },
    { period: 2, name: 'คาบที่ 2', startTime: '09:20', endTime: '10:10' },
    { period: 3, name: 'คาบที่ 3', startTime: '10:20', endTime: '11:10' },
    { period: 4, name: 'คาบที่ 4 (พักเที่ยง)', startTime: '11:10', endTime: '12:10' },
    { period: 5, name: 'คาบที่ 5', startTime: '12:10', endTime: '13:00' },
    { period: 6, name: 'คาบที่ 6', startTime: '13:00', endTime: '13:50' },
    { period: 7, name: 'คาบที่ 7', startTime: '14:00', endTime: '14:50' },
    { period: 8, name: 'คาบที่ 8 (เลิกเรียน)', startTime: '14:50', endTime: '16:00' },
  ]
};

/**
 * Initialize / Seed students into Firestore if empty
 */
export async function seedInitialStudentsIfNeeded(): Promise<Student[]> {
  try {
    const studentsCol = collection(db, STUDENTS_COLLECTION);
    const snap = await getDocs(studentsCol);
    
    if (snap.empty) {
      console.log('Seeding initial students to Firestore dek71...');
      const batch = writeBatch(db);
      for (const student of INITIAL_STUDENTS) {
        const studentDocRef = doc(db, STUDENTS_COLLECTION, student.id);
        batch.set(studentDocRef, student);
      }
      await batch.commit();
      return INITIAL_STUDENTS;
    } else {
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as Student));
    }
  } catch (error) {
    console.warn('Could not seed to Firestore (using local fallback):', error);
    return INITIAL_STUDENTS;
  }
}

/**
 * Real-time listener for students collection
 */
export function subscribeToStudents(callback: (students: Student[]) => void) {
  try {
    const studentsCol = collection(db, STUDENTS_COLLECTION);
    return onSnapshot(studentsCol, (snapshot) => {
      if (snapshot.empty) {
        // If empty, trigger seed
        seedInitialStudentsIfNeeded().then(callback);
      } else {
        const list = snapshot.docs.map(docSnap => ({
          ...docSnap.data(),
          id: docSnap.id,
        } as Student));
        // Sort by Grade (ม.1 -> ม.6), Room (1 -> 2), StudentCode
        list.sort((a, b) => {
          if (a.grade !== b.grade) return a.grade.localeCompare(b.grade, 'th');
          if (a.room !== b.room) return a.room - b.room;
          return a.studentCode.localeCompare(b.studentCode);
        });
        callback(list);
      }
    }, (error) => {
      console.warn('Firestore students subscription error:', error);
      callback(INITIAL_STUDENTS);
    });
  } catch (error) {
    console.warn('Subscription error:', error);
    callback(INITIAL_STUDENTS);
    return () => {};
  }
}

/**
 * Real-time listener for early departure records
 */
export function subscribeToDepartures(
  callback: (records: EarlyDepartureRecord[]) => void,
  onNewDeparture?: (record: EarlyDepartureRecord) => void
) {
  let isFirstLoad = true;
  try {
    const departuresCol = collection(db, DEPARTURES_COLLECTION);
    const q = query(departuresCol, orderBy('createdAt', 'desc'), limit(150));

    return onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(docSnap => ({
        ...docSnap.data(),
        id: docSnap.id,
      } as EarlyDepartureRecord));

      // Trigger instant alert for newly added records after initial load
      if (!isFirstLoad && onNewDeparture) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newRecord = { ...change.doc.data(), id: change.doc.id } as EarlyDepartureRecord;
            onNewDeparture(newRecord);
          }
        });
      }
      isFirstLoad = false;
      callback(records);
    }, (error) => {
      console.warn('Departures subscription error:', error);
      callback([]);
    });
  } catch (error) {
    console.warn('Departures subscription error:', error);
    callback([]);
    return () => {};
  }
}

/**
 * Add a new early departure record & update student status
 */
export async function createEarlyDepartureRecord(
  recordData: Omit<EarlyDepartureRecord, 'id' | 'createdAt'>
): Promise<EarlyDepartureRecord> {
  const id = `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const fullRecord: EarlyDepartureRecord = {
    ...recordData,
    id,
    createdAt: Date.now(),
  };

  try {
    // 1. Save departure record
    const departureDocRef = doc(db, DEPARTURES_COLLECTION, id);
    await setDoc(departureDocRef, fullRecord);

    // 2. Update student status to 'checked_out_early'
    const studentDocRef = doc(db, STUDENTS_COLLECTION, fullRecord.studentId);
    await updateDoc(studentDocRef, {
      status: 'checked_out_early',
    });

    return fullRecord;
  } catch (error) {
    console.error('Error saving departure record to Firestore:', error);
    throw error;
  }
}

/**
 * ADMIN: Add a new student
 */
export async function addStudent(studentData: Omit<Student, 'id'>): Promise<Student> {
  const id = `std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const newStudent: Student = {
    ...studentData,
    id,
  };
  try {
    const studentDocRef = doc(db, STUDENTS_COLLECTION, id);
    await setDoc(studentDocRef, newStudent);
    return newStudent;
  } catch (error) {
    console.error('Error adding student to Firestore:', error);
    throw error;
  }
}

/**
 * ADMIN: Update student details
 */
export async function updateStudent(studentId: string, updates: Partial<Student>): Promise<void> {
  try {
    const studentDocRef = doc(db, STUDENTS_COLLECTION, studentId);
    await updateDoc(studentDocRef, updates);
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
}

/**
 * ADMIN: Delete student
 */
export async function deleteStudent(studentId: string): Promise<void> {
  try {
    const studentDocRef = doc(db, STUDENTS_COLLECTION, studentId);
    await deleteDoc(studentDocRef);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
}

/**
 * ADMIN: Delete departure record
 */
export async function deleteDepartureRecord(recordId: string, studentId?: string): Promise<void> {
  try {
    const departureDocRef = doc(db, DEPARTURES_COLLECTION, recordId);
    await deleteDoc(departureDocRef);

    // Reset student status if requested
    if (studentId) {
      const studentDocRef = doc(db, STUDENTS_COLLECTION, studentId);
      await updateDoc(studentDocRef, {
        status: 'present',
      });
    }
  } catch (error) {
    console.error('Error deleting departure record:', error);
    throw error;
  }
}

/**
 * ADMIN: Reset all students to 'present' status (for a new day)
 */
export async function resetDailyAttendance(students: Student[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const student of students) {
      if (student.status !== 'present') {
        const docRef = doc(db, STUDENTS_COLLECTION, student.id);
        batch.update(docRef, { status: 'present' });
      }
    }
    await batch.commit();
  } catch (error) {
    console.error('Error resetting attendance:', error);
    throw error;
  }
}

/**
 * ADMIN: Re-seed full sample dataset for all 12 classrooms
 */
export async function reseedAllClassrooms(): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const student of INITIAL_STUDENTS) {
      const studentDocRef = doc(db, STUDENTS_COLLECTION, student.id);
      batch.set(studentDocRef, { ...student, status: 'present' });
    }
    await batch.commit();
  } catch (error) {
    console.error('Error reseeding classrooms:', error);
    throw error;
  }
}

/**
 * Schedule settings getter & setter
 */
export async function getScheduleConfig(): Promise<ClassScheduleConfig> {
  try {
    const snap = await getDocs(collection(db, SETTINGS_COLLECTION));
    if (!snap.empty) {
      const configDoc = snap.docs.find(d => d.id === 'schedule');
      if (configDoc) {
        return configDoc.data() as ClassScheduleConfig;
      }
    }
    return DEFAULT_SCHEDULE_CONFIG;
  } catch (e) {
    console.warn('Error fetching schedule config:', e);
    return DEFAULT_SCHEDULE_CONFIG;
  }
}

export async function saveScheduleConfig(config: ClassScheduleConfig): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'schedule');
    await setDoc(docRef, config);
  } catch (e) {
    console.error('Error saving schedule config:', e);
    throw e;
  }
}
