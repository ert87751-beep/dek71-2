import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Shield, 
  ShieldCheck, 
  Clock, 
  Menu,
  Plus,
  Sparkles,
  Wifi
} from 'lucide-react';
import { playEarlyDepartureAlertSound } from '../lib/sound';

interface HeaderProps {
  isAdmin: boolean;
  onToggleAdmin: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  unreadAlertCount: number;
  onOpenAlertDrawer: () => void;
  activeTab: 'checkout' | 'monitoring' | 'admin';
  onChangeTab: (tab: 'checkout' | 'monitoring' | 'admin') => void;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onToggleAdmin,
  soundEnabled,
  onToggleSound,
  unreadAlertCount,
  onOpenAlertDrawer,
  activeTab,
  onChangeTab,
  onOpenMobileMenu,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const thaiDateFormatter = new Intl.DateTimeFormat('th-TH', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const thaiTimeFormatter = new Intl.DateTimeFormat('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const getTabTitle = () => {
    switch (activeTab) {
      case 'monitoring':
        return 'Early Exit Monitoring & Dashboard';
      case 'checkout':
        return 'บันทึกการออกห้องเรียน / เช็คเอาท์ก่อนกำหนด';
      case 'admin':
        return 'Student Records & System Management';
      default:
        return 'ระบบบันทึกการออกห้องก่อนเวลา';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-30 sticky top-0 font-sans shadow-xs">
      
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title="เปิดเมนู"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span>{getTabTitle()}</span>
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
              dek71 Live
            </span>
          </h1>
        </div>
      </div>

      {/* Right: Actions, Live Clock, Sound & Notifications */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        
        {/* Clock Pill */}
        <div className="hidden xl:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{thaiDateFormatter.format(currentTime)}</span>
          <span className="font-mono font-bold text-indigo-700">
            {thaiTimeFormatter.format(currentTime)} น.
          </span>
        </div>

        {/* Quick Check-Out CTA (When not on checkout tab) */}
        {activeTab !== 'checkout' && (
          <button
            id="header-quick-checkout-btn"
            onClick={() => onChangeTab('checkout')}
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>บันทึกออกก่อนเวลา</span>
          </button>
        )}

        {/* Sound Toggle */}
        <button
          id="header-sound-toggle-btn"
          onClick={onToggleSound}
          title={soundEnabled ? 'เปิดเสียงแจ้งเตือนอยู่ (คลิกเพื่อปิด)' : 'ปิดเสียงแจ้งเตือน (คลิกเพื่อเปิด)'}
          className={`p-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1 ${
            soundEnabled
              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-rose-600" />
          )}
        </button>

        {/* Live Alerts Bell */}
        <button
          id="header-alerts-bell-btn"
          onClick={onOpenAlertDrawer}
          className="relative p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          title="รายการแจ้งเตือนสด"
        >
          <Bell className="w-4 h-4 text-amber-500" />
          {unreadAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm animate-pulse">
              {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
            </span>
          )}
        </button>

        {/* Admin Badge/Button */}
        <button
          id="header-admin-auth-btn"
          onClick={onToggleAdmin}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            isAdmin
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isAdmin ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Admin ON</span>
            </>
          ) : (
            <>
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">เข้าสู่ระบบแอดมิน</span>
              <span className="sm:hidden">แอดมิน</span>
            </>
          )}
        </button>

      </div>
    </header>
  );
};
