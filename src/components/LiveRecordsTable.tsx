import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Trash2, 
  Eye, 
  Phone, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Building2,
  Database,
  GraduationCap
} from 'lucide-react';
import { EarlyDepartureRecord } from '../types';
import { ALL_ROOMS, REASON_CONFIG } from '../data/initialData';

interface LiveRecordsTableProps {
  records: EarlyDepartureRecord[];
  isAdmin: boolean;
  onDeleteRecord?: (recordId: string, studentId: string) => void;
  onViewSlip: (record: EarlyDepartureRecord) => void;
  selectedRoomFilter?: string;
  onClearRoomFilter?: () => void;
}

export const LiveRecordsTable: React.FC<LiveRecordsTableProps> = ({
  records,
  isAdmin,
  onDeleteRecord,
  onViewSlip,
  selectedRoomFilter = 'all',
  onClearRoomFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>(selectedRoomFilter);
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [onlyEarly, setOnlyEarly] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Sync internal room state if prop changes
  React.useEffect(() => {
    if (selectedRoomFilter !== selectedRoom) {
      setSelectedRoom(selectedRoomFilter);
    }
  }, [selectedRoomFilter]);

  const today = new Date().toISOString().split('T')[0];

  // Stats computation
  const stats = useMemo(() => {
    const todayRecords = records.filter(r => r.date === today);
    const todayEarly = todayRecords.filter(r => r.isEarly);
    const totalMinutesMissed = todayEarly.reduce((acc, r) => acc + (r.earlyMinutes || 0), 0);

    // Find most common grade today
    const gradeCounts: Record<string, number> = {};
    todayEarly.forEach(r => {
      gradeCounts[r.grade] = (gradeCounts[r.grade] || 0) + 1;
    });
    let topGrade = 'ยังไม่มี';
    let maxGradeCount = 0;
    Object.entries(gradeCounts).forEach(([g, count]) => {
      if (count > maxGradeCount) {
        maxGradeCount = count;
        topGrade = `${g} (${count} ราย)`;
      }
    });

    // Find most common reason today
    const reasonCounts: Record<string, number> = {};
    todayEarly.forEach(r => {
      reasonCounts[r.reasonCategory] = (reasonCounts[r.reasonCategory] || 0) + 1;
    });
    let topReason = 'ไม่มี';
    let maxCount = 0;
    Object.entries(reasonCounts).forEach(([k, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topReason = REASON_CONFIG[k]?.label || k;
      }
    });

    return {
      todayCount: todayRecords.length,
      todayEarlyCount: todayEarly.length,
      totalMinutesMissed,
      topGrade,
      topReason,
    };
  }, [records, today]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedDate && r.date !== selectedDate) return false;
      if (selectedRoom !== 'all' && r.classRoom !== selectedRoom) return false;
      if (selectedReason !== 'all' && r.reasonCategory !== selectedReason) return false;
      if (onlyEarly && !r.isEarly) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = `${r.prefix} ${r.studentName}`.toLowerCase();
        const code = r.studentCode.toLowerCase();
        const room = r.classRoom.toLowerCase();
        const approver = r.approverName.toLowerCase();
        const pickup = (r.pickupPerson || '').toLowerCase();
        return name.includes(q) || code.includes(q) || room.includes(q) || approver.includes(q) || pickup.includes(q);
      }

      return true;
    });
  }, [records, selectedDate, selectedRoom, selectedReason, onlyEarly, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const headers = ['วันที่', 'เวลาออก', 'รหัสนักเรียน', 'คำนำหน้า', 'ชื่อ-นามสกุล', 'ระดับชั้น', 'เวลาเลิกเรียน', 'ออกก่อนกี่นาที', 'สาเหตุ', 'รายละเอียด', 'ผู้อนุมัติ', 'ผู้มารับ', 'เบอร์ติดต่อ'];
    const rows = filteredRecords.map(r => [
      r.date,
      r.departureTime,
      r.studentCode,
      r.prefix,
      r.studentName,
      r.classRoom,
      r.scheduledDismissalTime,
      r.earlyMinutes,
      REASON_CONFIG[r.reasonCategory]?.label || r.reasonCategory,
      `"${r.reasonDetail.replace(/"/g, '""')}"`,
      r.approverName,
      r.pickupPerson,
      r.pickupContact,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `early_departure_report_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Split Layout: Records (Left 3 cols) and Daily Summary Widget (Right 1 col) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left: Main Records Container */}
        <div className="w-full lg:flex-[3] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          
          {/* Header Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                  รายการล่าสุด (Real-time Logs)
                </h3>
                <span className="text-[11px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  แจ้งเตือนอัตโนมัติ ON
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                พบข้อมูล {filteredRecords.length} รายการ (จากทั้งหมด {records.length} รายการ)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="export-csv-btn"
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>ส่งออก CSV (Excel)</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              
              {/* Search Box */}
              <div className="relative sm:col-span-2">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  id="records-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ, รหัสนักเรียน, ห้อง, ผู้ปกครอง..."
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              {/* Room Filter */}
              <div>
                <select
                  id="records-room-filter"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="all">ทุกห้องเรียน (12 ห้อง)</option>
                  {ALL_ROOMS.map((r) => (
                    <option key={r} value={r}>ห้อง {r}</option>
                  ))}
                </select>
              </div>

              {/* Reason Filter */}
              <div>
                <select
                  id="records-reason-filter"
                  value={selectedReason}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="all">ทุกสาเหตุ</option>
                  {Object.entries(REASON_CONFIG).map(([k, cfg]) => (
                    <option key={k} value={k}>{cfg.label}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOnlyEarly(!onlyEarly)}
                  className={`px-2.5 py-1 rounded-md font-medium border transition-colors flex items-center gap-1.5 text-xs ${
                    onlyEarly
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>เฉพาะที่ออกก่อนกำหนด</span>
                </button>

                {selectedRoom !== 'all' && (
                  <button
                    onClick={() => {
                      setSelectedRoom('all');
                      if (onClearRoomFilter) onClearRoomFilter();
                    }}
                    className="px-2 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-xs font-semibold hover:bg-indigo-100"
                  >
                    ห้อง {selectedRoom} ✕
                  </button>
                )}
              </div>

              {/* Date Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px]">วันที่:</span>
                <input
                  id="records-date-filter"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate('')}
                    className="text-[11px] text-indigo-600 hover:underline"
                  >
                    ล้าง
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider sticky top-0 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="px-5 py-3">ชื่อ-นามสกุล</th>
                  <th className="px-4 py-3">ระดับชั้น</th>
                  <th className="px-4 py-3">เวลาออก</th>
                  <th className="px-4 py-3">สาเหตุ</th>
                  <th className="px-4 py-3">สถานะแจ้งเตือน</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="font-medium text-slate-600 text-sm">ไม่พบรายการบันทึกตามเงื่อนไข</p>
                      <p className="text-xs text-slate-400 mt-1">สามารถทำการเช็คเอาท์นักเรียนได้ที่ปุ่ม "บันทึกออกก่อนเวลา"</p>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const reasonInfo = REASON_CONFIG[record.reasonCategory] || REASON_CONFIG.other;

                    return (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Student Name */}
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-slate-800 text-sm">
                            {record.prefix} {record.studentName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                            <span>#{record.studentCode}</span>
                            <span>•</span>
                            <span>{record.date}</span>
                          </div>
                        </td>

                        {/* Room */}
                        <td className="px-4 py-3.5 text-sm font-bold text-slate-700">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                            {record.classRoom}
                          </span>
                        </td>

                        {/* Departure Time */}
                        <td className="px-4 py-3.5 font-mono text-indigo-600 font-bold text-sm">
                          <div>{record.departureTime} น.</div>
                          {record.isEarly && (
                            <span className="text-[10px] text-rose-600 font-sans font-medium block">
                              (ก่อน {record.earlyMinutes} น.)
                            </span>
                          )}
                        </td>

                        {/* Reason */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${reasonInfo.badgeBg}`}>
                            {reasonInfo.label}
                          </span>
                          {record.reasonDetail && (
                            <p className="text-[11px] text-slate-500 truncate max-w-[140px] mt-0.5" title={record.reasonDetail}>
                              {record.reasonDetail}
                            </p>
                          )}
                        </td>

                        {/* Notification / Parent Status */}
                        <td className="px-4 py-3.5">
                          {record.notifyParent ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              ส่งถึงผู้ปกครองแล้ว
                            </span>
                          ) : (
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                              บันทึกภายใน
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`view-slip-btn-${record.id}`}
                              onClick={() => onViewSlip(record)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              title="ดูใบอนุญาต"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {isAdmin && onDeleteRecord && (
                              <button
                                id={`delete-record-btn-${record.id}`}
                                onClick={() => {
                                  if (confirm(`คุณต้องการลบประวัติของ ${record.studentName} ใช่หรือไม่?`)) {
                                    onDeleteRecord(record.id, record.studentId);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="ลบรายการ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right: Daily Summary Widget (As in Professional Polish Design) */}
        <div className="w-full lg:flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            <span>สถิติรายวัน</span>
          </h3>

          <div className="space-y-4">
            
            {/* Metric 1 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">เช็คเอาท์ก่อนกำหนดรวม</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1">
                {stats.todayEarlyCount} <span className="text-sm font-normal text-slate-400">ราย</span>
              </div>
              <div className="text-[11px] text-indigo-600 font-medium mt-1">
                รวม {stats.totalMinutesMissed} นาที
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-indigo-500 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">ระดับชั้นที่ออกบ่อยสุด</div>
              <div className="text-lg font-bold text-slate-900 mt-1">
                {stats.topGrade}
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">สาเหตุยอดนิยมวันนี้</div>
              <div className="text-sm font-bold text-slate-800 mt-1">
                {stats.topReason}
              </div>
            </div>

            {/* Database Connection */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">Database Connection</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-slate-700">dek71 (Firebase)</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Sync Real-time WebSockets Live
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
