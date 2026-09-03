export interface Student {
  id: string;
  studentCode: string;
  prefix: 'นาย' | 'นางสาว' | 'เด็กชาย' | 'เด็กหญิง';
  firstName: string;
  lastName: string;
  grade: 'ม.1' | 'ม.2' | 'ม.3' | 'ม.4' | 'ม.5' | 'ม.6';
  room: 1 | 2;
  classRoom: string; // e.g. "ม.1/1", "ม.6/2"
  parentName: string;
  parentPhone: string;
  relationship: string; // เช่น บิดา, มารดา, ผู้ปกครอง
  photoUrl?: string;
  status: 'present' | 'checked_out_early' | 'excused';
  notes?: string;
}

export type DepartureReasonCategory = 
  | 'sick' // ป่วย/เข้าห้องพยาบาล
  | 'appointment' // พบแพทย์/นัดหมายสำคัญ
  | 'family' // ธุระครอบครัว/ผู้ปกครองมารับ
  | 'activity' // กิจกรรมโรงเรียน/แข่งขันภายนอก
  | 'emergency' // เหตุฉุกเฉิน
  | 'other'; // อื่นๆ

export interface EarlyDepartureRecord {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  prefix: string;
  grade: string;
  room: number;
  classRoom: string;
  scheduledDismissalTime: string; // e.g. "16:00"
  departureTime: string; // e.g. "14:25"
  departureDateTime: string; // ISO string
  date: string; // YYYY-MM-DD
  reasonCategory: DepartureReasonCategory;
  reasonDetail: string;
  approverName: string;
  approverRole: string; // เช่น ครูประจำชั้น, ครูฝ่ายปกครอง, ครูประจำวิชา
  pickupPerson: string;
  pickupContact: string;
  earlyMinutes: number; // ออกก่อนเวลากี่นาที
  isEarly: boolean;
  status: 'approved' | 'urgent' | 'pending';
  notifyParent: boolean;
  parentNotifiedAt?: string;
  createdAt: number;
  notes?: string;
}

export interface ClassScheduleConfig {
  defaultDismissalTime: string; // e.g. "16:00"
  morningDismissalTime?: string; // e.g. "12:00"
  periods: {
    period: number;
    name: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface LiveNotificationAlert {
  id: string;
  recordId: string;
  studentName: string;
  classRoom: string;
  studentCode: string;
  departureTime: string;
  earlyMinutes: number;
  reason: string;
  approver: string;
  timestamp: number;
  read: boolean;
}
