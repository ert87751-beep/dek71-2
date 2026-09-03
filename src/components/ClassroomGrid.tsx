import React from 'react';
import { Users, AlertTriangle, CheckCircle2, ChevronRight, School } from 'lucide-react';
import { Student, EarlyDepartureRecord } from '../types';
import { ALL_ROOMS } from '../data/initialData';

interface ClassroomGridProps {
  students: Student[];
  records: EarlyDepartureRecord[];
  selectedRoom: string;
  onSelectRoom: (room: string) => void;
  selectedGrade?: string;
  onSelectGrade?: (grade: string) => void;
}

export const ClassroomGrid: React.FC<ClassroomGridProps> = ({
  students,
  records,
  selectedRoom,
  onSelectRoom,
  selectedGrade = 'all',
  onSelectGrade,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todayDepartures = records.filter(r => r.date === today);

  const GRADES = ['ม.1', 'ม.2', 'ม.3', 'ม.4', 'ม.5', 'ม.6'];

  return (
    <div className="space-y-4">
      
      {/* Grade Quick Filter Bar (as styled in Professional Polish) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {GRADES.map((g) => {
          const isGradeActive = selectedGrade === g || (selectedRoom !== 'all' && selectedRoom.startsWith(g));
          const gradeStudents = students.filter(s => s.grade === g);
          const gradeEarlyCount = todayDepartures.filter(r => r.grade === g && r.isEarly).length;

          return (
            <button
              key={g}
              id={`filter-grade-btn-${g}`}
              onClick={() => {
                if (onSelectGrade) {
                  onSelectGrade(selectedGrade === g ? 'all' : g);
                } else {
                  onSelectRoom('all');
                }
              }}
              className={`rounded-xl p-3.5 text-center transition-all border ${
                isGradeActive
                  ? 'bg-indigo-50/80 border-indigo-300 shadow-sm ring-1 ring-indigo-400'
                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5">
                <span className={`text-xl sm:text-2xl font-extrabold ${
                  isGradeActive ? 'text-indigo-600' : 'text-slate-700'
                }`}>
                  {g}
                </span>
                {gradeEarlyCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-center gap-1">
                <span>2 ห้องเรียน</span>
                <span>•</span>
                <span>{gradeStudents.length} คน</span>
              </div>
              {gradeEarlyCount > 0 && (
                <div className="mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 rounded-md py-0.5">
                  ออกก่อน {gradeEarlyCount} ราย
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 12 Classroom Grid Container */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <School className="w-4 h-4 text-indigo-600" />
              <span>สถานะห้องเรียน ม.1 - ม.6 (12 ห้องเรียน)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              คลิกเพื่อกรองดูข้อมูลเฉพาะห้องเรียนที่ต้องการตรวจสอบ
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedRoom !== 'all' && (
              <button
                id="reset-room-filter-btn"
                onClick={() => onSelectRoom('all')}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                แสดงทุกห้อง ({selectedRoom}) ✕
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {ALL_ROOMS.map((room) => {
            const roomStudents = students.filter(s => s.classRoom === room);
            const roomEarlyDepartures = todayDepartures.filter(r => r.classRoom === room && r.isEarly);
            const isSelected = selectedRoom === room;
            const hasEarlyLeaves = roomEarlyDepartures.length > 0;

            return (
              <button
                key={room}
                id={`room-card-${room.replace('/', '-')}`}
                onClick={() => onSelectRoom(isSelected ? 'all' : room)}
                className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-300'
                    : hasEarlyLeaves
                    ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50 text-slate-800'
                    : 'bg-slate-50/80 border-slate-200 hover:bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-base font-extrabold tracking-tight ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}>
                    {room}
                  </span>

                  {hasEarlyLeaves ? (
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-0.5 ${
                      isSelected ? 'bg-white text-rose-600' : 'bg-rose-600 text-white animate-pulse'
                    }`}>
                      <AlertTriangle className="w-2.5 h-2.5" />
                      {roomEarlyDepartures.length} ออกก่อน
                    </span>
                  ) : (
                    <span className={`text-[10px] font-medium ${
                      isSelected ? 'text-indigo-100' : 'text-emerald-600 flex items-center gap-0.5'
                    }`}>
                      <CheckCircle2 className="w-3 h-3 inline" />
                      ปกติ
                    </span>
                  )}
                </div>

                <div className={`mt-3 pt-2 border-t flex items-center justify-between text-xs ${
                  isSelected ? 'border-indigo-500 text-indigo-100' : 'border-slate-200/80 text-slate-500'
                }`}>
                  <span>นร. {roomStudents.length} คน</span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
