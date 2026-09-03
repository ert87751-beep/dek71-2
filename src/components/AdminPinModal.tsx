import React, { useState } from 'react';
import { Lock, X, ShieldAlert, KeyRound, Check } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const verifyPin = (code: string) => {
    // Default system admin PIN is 1234
    if (code === '1234') {
      onSuccess();
      setPin('');
      setError(false);
    } else {
      setError(true);
      setTimeout(() => {
        setPin('');
        setError(false);
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-center relative animate-scale-in">
        
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <KeyRound className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-extrabold text-slate-900">
          เข้าสู่ระบบผู้ดูแลระบบ (Admin)
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          กรุณากรอกรหัส PIN 4 หลักเพื่อจัดการข้อมูลนักเรียนและประวัติ
        </p>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3 my-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                error
                  ? 'border-rose-500 bg-rose-500 animate-shake'
                  : pin.length > idx
                  ? 'border-blue-600 bg-blue-600 scale-110'
                  : 'border-slate-300 bg-slate-100'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-600 mb-4 animate-shake">
            รหัส PIN ไม่ถูกต้อง (รหัสเริ่มต้น: 1234)
          </p>
        )}

        {/* Number Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-blue-50 text-slate-800 font-bold text-lg border border-slate-200 shadow-xs transition-all"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setPin('1234');
              verifyPin('1234');
            }}
            className="h-12 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px] border border-amber-200 shadow-xs flex items-center justify-center transition-all"
            title="กรอก PIN 1234 อัตโนมัติ"
          >
            Auto 1234
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-blue-50 text-slate-800 font-bold text-lg border border-slate-200 shadow-xs transition-all"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs border border-slate-200 shadow-xs flex items-center justify-center transition-all"
          >
            ลบ
          </button>
        </div>

        <div className="mt-5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-400">
          รหัส PIN เริ่มต้นสำหรับทดสอบ: <strong className="text-slate-700">1234</strong>
        </div>

      </div>
    </div>
  );
};
