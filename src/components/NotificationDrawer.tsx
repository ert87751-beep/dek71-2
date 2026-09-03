import React from 'react';
import { X, Bell, Clock, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { EarlyDepartureRecord } from '../types';
import { REASON_CONFIG } from '../data/initialData';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: EarlyDepartureRecord[];
  onClearAll: () => void;
  onSelectRecord: (record: EarlyDepartureRecord) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onClearAll,
  onSelectRecord,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">การแจ้งเตือนเช็คเอาท์สด</h3>
                <p className="text-xs text-slate-400">
                  ทั้งหมด {alerts.length} รายการ
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {alerts.length > 0 && (
                <button
                  id="drawer-clear-all-btn"
                  onClick={onClearAll}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  title="ล้างการแจ้งเตือน"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                id="drawer-close-btn"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List of Alerts */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="font-medium text-sm text-slate-600">ไม่มีการแจ้งเตือนใหม่</p>
                <p className="text-xs text-slate-400 mt-1">
                  เมื่อมีนักเรียนเช็คเอาท์ออกก่อนเวลา รายการจะปรากฏและส่งเสียงเตือนที่นี่ทันที
                </p>
              </div>
            ) : (
              alerts.map((record) => {
                const reasonInfo = REASON_CONFIG[record.reasonCategory] || REASON_CONFIG.other;
                return (
                  <div
                    key={record.id}
                    onClick={() => {
                      onSelectRecord(record);
                      onClose();
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all cursor-pointer shadow-sm relative group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                          {record.classRoom}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {record.studentCode}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        ก่อน {record.earlyMinutes} น.
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-800 text-sm mt-1.5">
                      {record.prefix} {record.studentName}
                    </h4>

                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium border ${reasonInfo.badgeBg}`}>
                        {reasonInfo.label}
                      </span>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{record.departureTime} น.</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>ผู้อนุมัติ: {record.approverName}</span>
                      <span className="text-blue-600 group-hover:underline">
                        ดูใบอนุญาต →
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
            ระบบเชื่อมต่อแจ้งเตือนแบบ Real-Time ด้วย Firebase Firestore dek71
          </div>
        </div>
      </div>
    </div>
  );
};
