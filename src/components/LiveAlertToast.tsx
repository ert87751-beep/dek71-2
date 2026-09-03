import React from 'react';
import { AlertTriangle, Clock, X, ArrowRight, User, Phone, CheckCircle2 } from 'lucide-react';
import { EarlyDepartureRecord } from '../types';
import { REASON_CONFIG } from '../data/initialData';

interface LiveAlertToastProps {
  alert: EarlyDepartureRecord | null;
  onClose: () => void;
  onViewSlip: (record: EarlyDepartureRecord) => void;
}

export const LiveAlertToast: React.FC<LiveAlertToastProps> = ({
  alert,
  onClose,
  onViewSlip,
}) => {
  if (!alert) return null;

  const reasonInfo = REASON_CONFIG[alert.reasonCategory] || REASON_CONFIG.other;

  return (
    <div 
      id="live-departure-alert-toast"
      className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-full bg-white rounded-2xl shadow-2xl border-2 border-rose-500 overflow-hidden animate-bounce-short transition-all duration-300"
      style={{
        boxShadow: '0 20px 25px -5px rgba(225, 29, 72, 0.25), 0 8px 10px -6px rgba(225, 29, 72, 0.2)'
      }}
    >
      {/* Top Banner Alert Bar */}
      <div className="bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2.5 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-white/20 rounded-full animate-pulse">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide">
            แจ้งเตือนด่วน: มีการเช็คเอาท์ก่อนกำหนด!
          </span>
        </div>
        <button
          id="toast-close-btn"
          onClick={onClose}
          className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200">
                {alert.classRoom}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                รหัส: {alert.studentCode}
              </span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-1">
              {alert.prefix} {alert.studentName}
            </h4>
          </div>

          {/* Time badge */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-rose-600 font-bold text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{alert.departureTime} น.</span>
            </div>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 inline-block mt-0.5">
              ก่อนเวลา {alert.earlyMinutes} นาที
            </span>
          </div>
        </div>

        {/* Reason & Pickup */}
        <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="font-semibold text-slate-500">สาเหตุ:</span>
            <span className={`font-medium px-1.5 py-0.5 rounded border text-[11px] ${reasonInfo.badgeBg}`}>
              {reasonInfo.label}
            </span>
          </div>
          {alert.reasonDetail && (
            <p className="text-slate-600 pl-1 text-[11px] italic">
              "{alert.reasonDetail}"
            </p>
          )}
          <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-slate-200/60 text-[11px]">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              ผู้มารับ: <strong className="text-slate-800">{alert.pickupPerson || 'ผู้ปกครอง'}</strong>
            </span>
            <span className="text-slate-500">
              อนุมัติ: {alert.approverName}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            id="toast-view-slip-btn"
            onClick={() => {
              onViewSlip(alert);
              onClose();
            }}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <span>ดูใบอนุญาตออกนอกห้อง</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            id="toast-dismiss-btn"
            onClick={onClose}
            className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition-colors"
          >
            รับทราบ
          </button>
        </div>
      </div>
    </div>
  );
};
