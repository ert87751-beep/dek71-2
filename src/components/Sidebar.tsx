import React from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  Clock, 
  ShieldCheck, 
  Shield, 
  Bell, 
  Database,
  GraduationCap,
  Sparkles,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'checkout' | 'monitoring' | 'admin';
  onChangeTab: (tab: 'checkout' | 'monitoring' | 'admin') => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  unreadAlertCount: number;
  onOpenAlertDrawer: () => void;
  totalStudentsCount: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  isAdmin,
  onToggleAdmin,
  unreadAlertCount,
  onOpenAlertDrawer,
  totalStudentsCount,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'monitoring' as const,
      label: 'Dashboard & มอนิเตอร์',
      sublabel: 'สถานะ 12 ห้องเรียน & บันทึกสด',
      icon: LayoutDashboard,
    },
    {
      id: 'checkout' as const,
      label: 'บันทึกออกก่อนเวลา',
      sublabel: 'เช็คเอาท์ด่วน & คำนวณเวลา',
      icon: UserCheck,
    },
    {
      id: 'admin' as const,
      label: 'Student Records & แอดมิน',
      sublabel: `ข้อมูลนักเรียน (${totalStudentsCount}) & ตั้งค่า`,
      icon: Users,
      requiresAdmin: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`w-64 bg-slate-900 flex flex-col shrink-0 z-40 border-r border-slate-800 font-sans transition-transform duration-300 lg:translate-x-0 ${
          isOpenMobile 
            ? 'fixed inset-y-0 left-0 translate-x-0 shadow-2xl' 
            : 'hidden lg:flex'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-md">
              71
            </div>
            <div>
              <div className="text-white font-bold text-lg tracking-tight flex items-center gap-1.5">
                DEK71 System
              </div>
              <span className="text-[11px] text-indigo-300 font-medium">
                Early Departure Guard
              </span>
            </div>
          </div>

          {isOpenMobile && (
            <button 
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider px-3 pb-2 flex items-center justify-between">
            <span>เมนูระบบ (Navigation)</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              ม.1-ม.6
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onChangeTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs sm:text-sm truncate">
                    {item.label}
                  </div>
                  <div className={`text-[10px] truncate ${isActive ? 'text-indigo-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {item.sublabel}
                  </div>
                </div>

                {item.id === 'admin' && !isAdmin && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                    PIN
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <div className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider px-3 pb-2">
              การแจ้งเตือน & ความปลอดภัย
            </div>

            {/* Alert Drawer Trigger */}
            <button
              id="sidebar-alert-trigger"
              onClick={() => {
                onOpenAlertDrawer();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg text-xs font-medium transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>การแจ้งเตือนสด</span>
              </div>
              {unreadAlertCount > 0 ? (
                <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-full animate-pulse">
                  {unreadAlertCount} รายการ
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">0 รายการ</span>
              )}
            </button>

            {/* Admin Toggle */}
            <button
              id="sidebar-admin-toggle"
              onClick={onToggleAdmin}
              className={`w-full flex items-center justify-between px-3 py-2 mt-1 rounded-lg text-xs font-medium transition-all ${
                isAdmin 
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                ) : (
                  <Shield className="w-4 h-4 text-slate-400" />
                )}
                <span>{isAdmin ? 'สิทธิ์ผู้ดูแลระบบ (ON)' : 'เข้าสู่ระบบแอดมิน'}</span>
              </div>
              <span className="text-[10px] text-slate-500">
                {isAdmin ? 'ล็อกอินแล้ว' : 'PIN 1234'}
              </span>
            </button>
          </div>
        </nav>

        {/* Bottom Footer Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-slate-400 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[11px] font-medium text-slate-300">Firebase Firestore</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-400">dek71</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            ระบบบันทึกเวลาและแจ้งเตือนทันทีเมื่อมีการเช็คเอาท์ก่อนกำหนด
          </p>
        </div>
      </aside>
    </>
  );
};
