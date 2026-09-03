import React from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Share2, 
  ShieldCheck, 
  AlertTriangle,
  GraduationCap,
  Calendar,
  UserCheck
} from 'lucide-react';
import { EarlyDepartureRecord } from '../types';
import { REASON_CONFIG } from '../data/initialData';

interface DepartureSlipModalProps {
  record: EarlyDepartureRecord | null;
  onClose: () => void;
}

export const DepartureSlipModal: React.FC<DepartureSlipModalProps> = ({
  record,
  onClose,
}) => {
  if (!record) return null;

  const reasonInfo = REASON_CONFIG[record.reasonCategory] || REASON_CONFIG.other;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const summary = `[ใบอนุญาตออกนอกห้องเรียน dek71]
นักเรียน: ${record.prefix} ${record.studentName} (${record.classRoom})
รหัสนักเรียน: ${record.studentCode}
เวลาออก: ${record.departureTime} น. (ก่อนเวลา ${record.earlyMinutes} นาที)
สาเหตุ: ${reasonInfo.label} - ${record.reasonDetail}
ผู้มารับ: ${record.pickupPerson}
ผู้อนุมัติ: ${record.approverName}
วันที่: ${record.date}`;

    navigator.clipboard.writeText(summary);
    alert('คัดลอกข้อมูลสรุปใบอนุญาตเรียบร้อยแล้ว');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transition-all my-8">
        
        {/* Header Action Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">ใบอนุญาตออกนอกห้องเรียน (Gate Pass)</h3>
              <p className="text-[11px] text-slate-400">ระบบบันทึกเวลา dek71</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="slip-print-btn"
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="พิมพ์ใบอนุญาต"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">พิมพ์</span>
            </button>
            <button
              id="slip-share-btn"
              onClick={handleCopyText}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
              title="คัดลอกข้อความ"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="slip-close-btn"
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 sm:p-8 space-y-6 bg-white print-container">
          
          {/* Slip Header */}
          <div className="text-center pb-4 border-b-2 border-dashed border-slate-200">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 mb-2">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              โรงเรียนตัวอย่างมัธยมศึกษา (dek71)
            </h2>
            <p className="text-xs font-semibold text-slate-600">
              บัตรอนุญาตออกนอกสถานศึกษา / ห้องเรียนก่อนเวลา
            </p>
            <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
              <span>เลขที่: #{record.id.slice(-6).toUpperCase()}</span>
              <span>•</span>
              <span>วันที่: {record.date}</span>
            </div>
          </div>

          {/* Student Highlights Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  ข้อมูลนักเรียน
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {record.prefix} {record.studentName}
                </h3>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs">
                  ห้อง {record.classRoom}
                </span>
                <p className="text-[11px] font-mono text-slate-500 mt-1">
                  รหัส: {record.studentCode}
                </p>
              </div>
            </div>

            {/* Time Comparison Badges */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-medium">เวลาที่เช็คเอาท์ออก</span>
                <span className="text-sm font-extrabold text-slate-800 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  {record.departureTime} น.
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-medium">เวลาเลิกเรียนปกติ</span>
                <span className="text-sm font-extrabold text-slate-600 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {record.scheduledDismissalTime} น.
                </span>
              </div>
            </div>

            {/* Early status bar */}
            {record.isEarly ? (
              <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ออกก่อนกำหนด
                </span>
                <span className="bg-rose-600 text-white px-2 py-0.5 rounded-md text-[11px]">
                  {record.earlyMinutes} นาที
                </span>
              </div>
            ) : (
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ออกตามเวลาปกติ
              </div>
            )}
          </div>

          {/* Details & Reasons */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">สาเหตุการออก:</span>
              <span className={`font-bold px-2 py-0.5 rounded ${reasonInfo.badgeBg}`}>
                {reasonInfo.label}
              </span>
            </div>

            {record.reasonDetail && (
              <div className="py-1 border-b border-slate-100">
                <span className="text-slate-500 block text-[11px] mb-0.5">รายละเอียด:</span>
                <span className="font-semibold text-slate-800">{record.reasonDetail}</span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">ผู้มารับนักเรียน:</span>
              <span className="font-bold text-slate-800">{record.pickupPerson || 'ผู้ปกครอง'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">เบอร์โทรติดต่อ:</span>
              <span className="font-bold text-slate-800">{record.pickupContact || '-'}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">ผู้อนุมัติ:</span>
              <span className="font-bold text-blue-700">{record.approverName}</span>
            </div>
          </div>

          {/* Security Gate Verification QR & Signature */}
          <div className="grid grid-cols-2 gap-4 items-center pt-2 border-t-2 border-dashed border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-xl flex items-center justify-center p-1.5 shadow-inner">
                <QrCode className="w-full h-full" />
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                <strong className="text-slate-700 block">สแกนตรวจสอบ</strong>
                แสดงใบนี้ต่อเจ้าหน้าที่รปภ. ประตูโรงเรียน
              </div>
            </div>

            <div className="text-center border-t border-slate-300 pt-2 mt-4">
              <div className="h-6 flex items-center justify-center text-xs italic text-blue-800 font-serif font-bold">
                {record.approverName}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                (ลายมือชื่อครูผู้อนุมัติ / ฝ่ายปกครอง)
              </p>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-2 no-print">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ใบอนุญาต</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
