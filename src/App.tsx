import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ClassroomGrid } from './components/ClassroomGrid';
import { LiveRecordsTable } from './components/LiveRecordsTable';
import { QuickCheckOut } from './components/QuickCheckOutModal';
import { AdminPanel } from './components/AdminPanel';
import { DepartureSlipModal } from './components/DepartureSlipModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LiveAlertToast } from './components/LiveAlertToast';
import { AdminPinModal } from './components/AdminPinModal';
import { 
  Student, 
  EarlyDepartureRecord, 
  ClassScheduleConfig 
} from './types';
import { 
  subscribeToStudents, 
  subscribeToDepartures, 
  getScheduleConfig,
  deleteDepartureRecord,
  seedInitialStudentsIfNeeded 
} from './services/firestoreService';
import { playEarlyDepartureAlertSound } from './lib/sound';
import { Shield, KeyRound, ArrowRight, ShieldCheck, Sparkles, School } from 'lucide-react';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'checkout' | 'monitoring' | 'admin'>('monitoring');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Firestore Live State
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<EarlyDepartureRecord[]>([]);
  const [scheduleConfig, setScheduleConfig] = useState<ClassScheduleConfig>({
    defaultDismissalTime: '16:00',
    morningDismissalTime: '12:00',
    specialNotes: '',
  });

  // Admin Auth State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // UI Filter State
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');

  // Sound & Live Alert State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [liveToastAlert, setLiveToastAlert] = useState<EarlyDepartureRecord | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<EarlyDepartureRecord[]>([]);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);

  // Active Slip Modal
  const [viewingSlipRecord, setViewingSlipRecord] = useState<EarlyDepartureRecord | null>(null);

  // Initialize Firestore listeners & seeding
  useEffect(() => {
    seedInitialStudentsIfNeeded();

    // Subscribe to Students
    const unsubscribeStudents = subscribeToStudents((updatedStudents) => {
      setStudents(updatedStudents);
    });

    // Subscribe to Departures & Real-time Alerts
    let isInitialLoad = true;
    const unsubscribeDepartures = subscribeToDepartures((updatedRecords) => {
      setRecords(updatedRecords);

      // On initial load, collect today's early departures
      if (isInitialLoad) {
        const today = new Date().toISOString().split('T')[0];
        const todayEarly = updatedRecords.filter(r => r.date === today && r.isEarly);
        setRecentAlerts(todayEarly);
        setUnreadAlertCount(todayEarly.length);
        isInitialLoad = false;
      } else if (updatedRecords.length > 0) {
        // Trigger live toast on new addition
        const latestRecord = updatedRecords[0];
        if (latestRecord.isEarly) {
          setLiveToastAlert(latestRecord);
          setRecentAlerts(prev => [latestRecord, ...prev.filter(r => r.id !== latestRecord.id)]);
          setUnreadAlertCount(prev => prev + 1);

          if (soundEnabled) {
            playEarlyDepartureAlertSound();
          }
        }
      }
    });

    // Fetch Schedule config
    getScheduleConfig().then((cfg) => {
      if (cfg) setScheduleConfig(cfg);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeDepartures();
    };
  }, [soundEnabled]);

  // Handle Check-out Success
  const handleCheckOutSuccess = (newRecord: EarlyDepartureRecord) => {
    setViewingSlipRecord(newRecord);
    if (newRecord.isEarly) {
      setLiveToastAlert(newRecord);
      setRecentAlerts(prev => [newRecord, ...prev.filter(r => r.id !== newRecord.id)]);
      setUnreadAlertCount(prev => prev + 1);
    }
  };

  // Toggle Admin Mode
  const handleToggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setIsPinModalOpen(true);
    }
  };

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    setIsPinModalOpen(false);
  };

  const handleDeleteRecord = async (recordId: string, studentId: string) => {
    try {
      await deleteDepartureRecord(recordId, studentId);
      setRecentAlerts(prev => prev.filter(r => r.id !== recordId));
    } catch (err) {
      console.error('Delete error:', err);
      alert('ไม่สามารถลบประวัติได้');
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'admin' && !isAdmin) {
            setIsPinModalOpen(true);
          }
        }}
        isAdmin={isAdmin}
        onToggleAdmin={handleToggleAdmin}
        unreadAlertCount={unreadAlertCount}
        onOpenAlertDrawer={() => {
          setIsAlertDrawerOpen(true);
          setUnreadAlertCount(0);
        }}
        totalStudentsCount={students.length}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Bar */}
        <Header
          isAdmin={isAdmin}
          onToggleAdmin={handleToggleAdmin}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          unreadAlertCount={unreadAlertCount}
          onOpenAlertDrawer={() => {
            setIsAlertDrawerOpen(true);
            setUnreadAlertCount(0);
          }}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* TAB 1: Monitoring / Dashboard */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              
              {/* Classroom Grid & Quick Grade Filters */}
              <ClassroomGrid
                students={students}
                records={records}
                selectedRoom={selectedRoomFilter}
                onSelectRoom={(room) => {
                  setSelectedRoomFilter(room);
                }}
                selectedGrade={selectedGradeFilter}
                onSelectGrade={(grade) => {
                  setSelectedGradeFilter(grade);
                  if (grade === 'all') {
                    setSelectedRoomFilter('all');
                  } else {
                    setSelectedRoomFilter(`${grade}/1`);
                  }
                }}
              />

              {/* Real-time Logs & Daily Statistics Split Section */}
              <LiveRecordsTable
                records={records}
                isAdmin={isAdmin}
                onDeleteRecord={handleDeleteRecord}
                onViewSlip={(rec) => setViewingSlipRecord(rec)}
                selectedRoomFilter={selectedRoomFilter}
                onClearRoomFilter={() => setSelectedRoomFilter('all')}
              />

            </div>
          )}

          {/* TAB 2: Quick Check-Out Terminal */}
          {activeTab === 'checkout' && (
            <QuickCheckOut
              students={students}
              onCheckOutSuccess={handleCheckOutSuccess}
              defaultDismissalTime={scheduleConfig.defaultDismissalTime}
            />
          )}

          {/* TAB 3: Admin Management */}
          {activeTab === 'admin' && (
            <>
              {isAdmin ? (
                <AdminPanel
                  students={students}
                  scheduleConfig={scheduleConfig}
                  onUpdateScheduleConfig={setScheduleConfig}
                  onLogoutAdmin={() => setIsAdmin(false)}
                />
              ) : (
                <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                    <KeyRound className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      ต้องใช้สิทธิ์ผู้ดูแลระบบ (Admin Required)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      กรุณากรอกรหัส PIN 4 หลักเพื่อเข้าจัดการข้อมูลนักเรียน ม.1 - ม.6 และฐานข้อมูล dek71
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPinModalOpen(true)}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Shield className="w-4 h-4" />
                    <span>กรอกรหัส PIN (เริ่มต้น: 1234)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* 3. Popups & Modals */}
      
      {/* Live Toast Alert for Instant Notifications */}
      <LiveAlertToast
        alert={liveToastAlert}
        onClose={() => setLiveToastAlert(null)}
        onViewSlip={(rec) => {
          setViewingSlipRecord(rec);
          setLiveToastAlert(null);
        }}
      />

      {/* Slide-over Notification Drawer */}
      <NotificationDrawer
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
        alerts={recentAlerts}
        onClearAll={() => setRecentAlerts([])}
        onSelectRecord={(rec) => {
          setViewingSlipRecord(rec);
          setIsAlertDrawerOpen(false);
        }}
      />

      {/* Gate Pass / Departure Slip Printable Modal */}
      <DepartureSlipModal
        record={viewingSlipRecord}
        onClose={() => setViewingSlipRecord(null)}
      />

      {/* Admin 4-digit PIN Authentication Modal */}
      <AdminPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleAdminSuccess}
      />

    </div>
  );
}
export default App;
