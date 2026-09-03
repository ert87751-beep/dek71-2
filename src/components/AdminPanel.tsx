import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  RotateCcw, 
  Database, 
  Clock, 
  Users, 
  Search, 
  Save, 
  Check, 
  AlertTriangle, 
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Phone,
  UserCheck
} from 'lucide-react';
import { Student, ClassScheduleConfig } from '../types';
import { ALL_ROOMS } from '../data/initialData';
import { 
  addStudent, 
  updateStudent, 
  deleteStudent, 
  resetDailyAttendance, 
  reseedAllClassrooms,
  saveScheduleConfig 
} from '../services/firestoreService';
import { playSuccessChime } from '../lib/sound';

interface AdminPanelProps {
  students: Student[];
  scheduleConfig: ClassScheduleConfig;
  onUpdateScheduleConfig: (config: ClassScheduleConfig) => void;
  onLogoutAdmin: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  students,
  scheduleConfig,
  onUpdateScheduleConfig,
  onLogoutAdmin,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'schedule' | 'database'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  
  // Student Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form fields for Add / Edit
  const [prefix, setPrefix] = useState<'นาย' | 'นางสาว' | 'เด็กชาย' | 'เด็กหญิง'>('เด็กชาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [grade, setGrade] = useState<'ม.1' | 'ม.2' | 'ม.3' | 'ม.4' | 'ม.5' | 'ม.6'>('ม.1');
  const [room, setRoom] = useState<1 | 2>(1);
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [relationship, setRelationship] = useState('ผู้ปกครอง');
  const [isProcessing, setIsProcessing] = useState(false);

  // Schedule settings state
  const [dismissalTimeInput, setDismissalTimeInput] = useState(scheduleConfig.defaultDismissalTime || '16:00');
  const [morningDismissalInput, setMorningDismissalInput] = useState(scheduleConfig.morningDismissalTime || '12:00');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const openAddModal = () => {
    setEditingStudent(null);
    setPrefix('เด็กชาย');
    setFirstName('');
    setLastName('');
    setStudentCode(String(Math.floor(10000 + Math.random() * 90000)));
    setGrade('ม.1');
    setRoom(1);
    setParentName('');
    setParentPhone('08');
    setRelationship('บิดา');
    setIsModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setPrefix(student.prefix);
    setFirstName(student.firstName);
    setLastName(student.lastName);
    setStudentCode(student.studentCode);
    setGrade(student.grade);
    setRoom(student.room);
    setParentName(student.parentName);
    setParentPhone(student.parentPhone);
    setRelationship(student.relationship);
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !studentCode.trim()) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setIsProcessing(true);
    try {
      const classRoom = `${grade}/${room}`;
      if (editingStudent) {
        // Update
        await updateStudent(editingStudent.id, {
          prefix,
          firstName,
          lastName,
          studentCode,
          grade,
          room,
          classRoom,
          parentName,
          parentPhone,
          relationship,
        });
      } else {
        // Create
        await addStudent({
          prefix,
          firstName,
          lastName,
          studentCode,
          grade,
          room,
          classRoom,
          parentName,
          parentPhone,
          relationship,
          status: 'present',
        });
      }
      playSuccessChime();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูลนักเรียน');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`คุณต้องการลบข้อมูลนักเรียน: ${student.prefix} ${student.firstName} ${student.lastName} (ห้อง ${student.classRoom}) ใช่หรือไม่?`)) {
      return;
    }
    try {
      await deleteStudent(student.id);
      playSuccessChime();
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถลบข้อมูลได้');
    }
  };

  const handleResetAttendance = async () => {
    if (!confirm('คุณต้องการรีเซ็ตสถานะการเข้าเรียนของนักเรียนทุกคนให้กลับเป็น "อยู่ในห้องเรียน" ใช่หรือไม่?')) {
      return;
    }
    setIsProcessing(true);
    try {
      await resetDailyAttendance(students);
      playSuccessChime();
      alert('รีเซ็ตสถานะการเข้าเรียนเรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการรีเซ็ต');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReseedAll = async () => {
    if (!confirm('คุณต้องการโหลดข้อมูลตัวอย่างนักเรียนทั้ง 12 ห้องเรียน (ม.1-ม.6 ชั้นละ 2 ห้อง) ใหม่อีกครั้งหรือไม่?')) {
      return;
    }
    setIsProcessing(true);
    try {
      await reseedAllClassrooms();
      playSuccessChime();
      alert('โหลดข้อมูลนักเรียนตัวอย่าง 12 ห้องเรียนสำเร็จ');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูลตัวอย่าง');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newConfig: ClassScheduleConfig = {
        ...scheduleConfig,
        defaultDismissalTime: dismissalTimeInput,
        morningDismissalTime: morningDismissalInput,
      };
      await saveScheduleConfig(newConfig);
      onUpdateScheduleConfig(newConfig);
      playSuccessChime();
      setSaveSuccessMsg('บันทึกการตั้งค่าเวลาเรียบร้อยแล้ว');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกเวลา');
    }
  };

  // Filter students for table
  const filteredStudents = students.filter(s => {
    if (selectedRoomFilter !== 'all' && s.classRoom !== selectedRoomFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = `${s.prefix}${s.firstName} ${s.lastName}`.toLowerCase();
      const code = s.studentCode.toLowerCase();
      const roomStr = s.classRoom.toLowerCase();
      return name.includes(q) || code.includes(q) || roomStr.includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Admin Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>โหมดผู้ดูแลระบบ (Admin Access) • dek71</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ระบบจัดการข้อมูลนักเรียน & การตั้งค่า
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            เพิ่ม ลบ แก้ไข ข้อมูลนักเรียน ม.1 - ม.6 (12 ห้องเรียน) และจัดการเวลาเลิกเรียน
          </p>
        </div>

        <button
          id="admin-logout-btn"
          onClick={onLogoutAdmin}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors self-start sm:self-auto"
        >
          ออกจากโหมดแอดมิน
        </button>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          id="admin-subtab-students"
          onClick={() => setActiveSubTab('students')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'students'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>จัดการนักเรียน ({students.length} คน)</span>
        </button>

        <button
          id="admin-subtab-schedule"
          onClick={() => setActiveSubTab('schedule')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'schedule'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>ตั้งค่าเวลาเลิกเรียน</span>
        </button>

        <button
          id="admin-subtab-database"
          onClick={() => setActiveSubTab('database')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'database'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>ฐานข้อมูล Firestore (dek71)</span>
        </button>
      </div>

      {/* TAB 1: Student Management */}
      {activeSubTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="admin-add-student-btn"
                onClick={openAddModal}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มนักเรียนใหม่</span>
              </button>

              <button
                id="admin-reset-attendance-btn"
                onClick={handleResetAttendance}
                disabled={isProcessing}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="รีเซ็ตสถานะทุกคนให้กลับเป็นอยู่ในห้องเรียนสำหรับวันใหม่"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>รีเซ็ตสถานะวันใหม่</span>
              </button>

              <button
                id="admin-reseed-btn"
                onClick={handleReseedAll}
                disabled={isProcessing}
                className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="โหลดข้อมูลตัวอย่างนักเรียนทั้ง 12 ห้องเรียน (ม.1-ม.6)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>โหลดตัวอย่าง 12 ห้องเรียน</span>
              </button>
            </div>

            {/* Search & Filter */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  id="admin-student-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหานักเรียน..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <select
                id="admin-room-filter"
                value={selectedRoomFilter}
                onChange={(e) => setSelectedRoomFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="all">ทุกห้องเรียน</option>
                {ALL_ROOMS.map(r => (
                  <option key={r} value={r}>ห้อง {r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">รหัสนักเรียน</th>
                  <th className="py-3 px-4">ชื่อ - นามสกุล</th>
                  <th className="py-3 px-4">ระดับชั้น</th>
                  <th className="py-3 px-4">ผู้ปกครอง & เบอร์โทร</th>
                  <th className="py-3 px-4">สถานะปัจจุบัน</th>
                  <th className="py-3 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      ไม่พบข้อมูลนักเรียน
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                        #{std.studentCode}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="font-bold text-slate-900">
                          {std.prefix} {std.firstName} {std.lastName}
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-200">
                          {std.classRoom}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="text-slate-800 font-medium">{std.parentName} ({std.relationship})</div>
                        <a href={`tel:${std.parentPhone}`} className="text-indigo-600 hover:underline text-[11px]">
                          {std.parentPhone}
                        </a>
                      </td>
                      <td className="py-2.5 px-4">
                        {std.status === 'checked_out_early' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            ออกก่อนเวลา
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                            อยู่ในห้องเรียน
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`edit-std-${std.id}`}
                            onClick={() => openEditModal(std)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="แก้ไขข้อมูล"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`del-std-${std.id}`}
                            onClick={() => handleDeleteStudent(std)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ลบนักเรียน"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 2: Schedule Settings */}
      {activeSubTab === 'schedule' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>กำหนดเวลาเลิกเรียนมาตรฐานเพื่อใช้คำนวณการออกห้องก่อนเวลา</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ระบบจะใช้เวลานี้เป็นเกณฑ์เปรียบเทียบเมื่อนักเรียนเช็คเอาท์ออก หากออกก่อนจะคำนวณจำนวนนาทีและแจ้งเตือนทันที
            </p>
          </div>

          <form onSubmit={handleSaveSchedule} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                เวลาเลิกเรียนปกติ (ช่วงบ่าย)
              </label>
              <input
                id="schedule-default-dismissal"
                type="time"
                value={dismissalTimeInput}
                onChange={(e) => setDismissalTimeInput(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                เช่น 16:00 น. หรือ 15:30 น.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                เวลาพักกลางวัน / เลิกเรียนภาคเช้า (กรณีพิเศษ)
              </label>
              <input
                id="schedule-morning-dismissal"
                type="time"
                value={morningDismissalInput}
                onChange={(e) => setMorningDismissalInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            <button
              id="save-schedule-btn"
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>บันทึกการตั้งค่าเวลา</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Database Information */}
      {activeSubTab === 'database' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                สถานะการเชื่อมต่อฐานข้อมูล Google Cloud Firestore
              </h3>
              <p className="text-xs text-slate-500">
                โครงการ dek71 (dek71-e6f93)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Project ID</span>
              <span className="text-sm font-mono font-bold text-slate-800">dek71-e6f93</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Collection นักเรียน</span>
              <span className="text-sm font-mono font-bold text-slate-800">students_dek71 ({students.length} รายการ)</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Collection ประวัติการออก</span>
              <span className="text-sm font-mono font-bold text-slate-800">departures_dek71</span>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                <span>{editingStudent ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มข้อมูลนักเรียนใหม่'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              
              {/* Prefix & Name */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">คำนำหน้า</label>
                  <select
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="เด็กชาย">เด็กชาย</option>
                    <option value="เด็กหญิง">เด็กหญิง</option>
                    <option value="นาย">นาย</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อจริง *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="เช่น ณัฐภัทร"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="เช่น แสงสว่าง"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Student Code & Grade / Room */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">รหัสนักเรียน *</label>
                  <input
                    type="text"
                    required
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="เช่น 10105"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ระดับชั้น</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="ม.1">ม.1</option>
                    <option value="ม.2">ม.2</option>
                    <option value="ม.3">ม.3</option>
                    <option value="ม.4">ม.4</option>
                    <option value="ม.5">ม.5</option>
                    <option value="ม.6">ม.6</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ห้อง</label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(Number(e.target.value) as 1 | 2)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>ห้อง 1 ({grade}/1)</option>
                    <option value={2}>ห้อง 2 ({grade}/2)</option>
                  </select>
                </div>
              </div>

              {/* Parent Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ชื่อผู้ปกครอง</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="เช่น นายสมบูรณ์ แสงสว่าง"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ผู้ปกครอง</label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>บันทึกข้อมูล</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
