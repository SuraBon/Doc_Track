import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface LoginProps {
  onGuestAccess?: () => void;
}

export default function Login({ onGuestAccess }: LoginProps) {
  const { loginUser, setupUserPin, loading } = useAuth();
  
  const [employeeId, setEmployeeId] = useState('');
  const [pin, setPin] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  
  // For setup
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error('กรุณากรอกรหัสพนักงาน');
      return;
    }

    if (isSetup) {
      if (pin.length < 4 || !name || !branch) {
        toast.error('กรุณากรอกข้อมูลให้ครบถ้วนและ PIN ต้องมี 4 หลัก');
        return;
      }
      const res = await setupUserPin(employeeId, pin, name, branch);
      if (res.success) {
        toast.success('ตั้งค่า PIN สำเร็จ');
      } else {
        toast.error(res.error || 'เกิดข้อผิดพลาดในการตั้งค่า');
      }
    } else {
      if (pin && pin.length < 4) {
        toast.error('PIN ต้องมี 4 หลัก');
        return;
      }
      
      const res = await loginUser(employeeId, pin);
      
      if (res.success) {
        if (res.needsSetup) {
          setIsSetup(true);
          setName(res.name !== 'Unknown' ? res.name! : '');
          setBranch(res.branch !== 'Unknown' ? res.branch! : '');
          toast.info('เข้าใช้งานครั้งแรก กรุณาตั้งค่า PIN และข้อมูลของท่าน');
        } else {
          toast.success('เข้าสู่ระบบสำเร็จ');
        }
      } else {
        toast.error(res.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl sm:shadow-2xl p-6 sm:p-8 border border-outline-variant/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-primary font-bold">local_shipping</span>
          </div>
          <h1 className="text-2xl font-black font-display text-primary">
            {isSetup ? 'ตั้งค่าการเข้าใช้งาน' : 'เข้าสู่ระบบ'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-2">
            {isSetup ? 'กรุณาตั้งรหัส PIN และข้อมูลของท่าน' : 'ระบบติดตามพัสดุและเอกสาร'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1.5">รหัสพนักงาน</label>
            <input
              type="text"
              value={employeeId}
              onChange={e => setEmployeeId(e.target.value)}
              disabled={isSetup || loading}
              className="w-full h-12 bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 text-primary font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
              placeholder="เช่น EMP001"
            />
          </div>

          {isSetup && (
            <>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1.5">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="ชื่อของท่าน"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-on-surface-variant mb-1.5">สาขาประจำ</label>
                <input
                  type="text"
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="เช่น พิบูลสงคราม"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold text-on-surface-variant mb-1.5">
              {isSetup ? 'ตั้งรหัส PIN 4 หลัก' : 'รหัส PIN (เว้นว่างหากเข้าครั้งแรก)'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
              className="w-full h-12 bg-surface-container-lowest border border-outline-variant/60 rounded-xl px-4 text-center tracking-[0.5em] text-xl font-bold font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="****"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-6 bg-primary text-white rounded-xl font-display font-bold shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            ) : (
              <span>{isSetup ? 'บันทึกข้อมูลและเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}</span>
            )}
          </button>
          
          {onGuestAccess && !isSetup && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onGuestAccess}
                className="text-on-surface-variant/60 font-bold text-sm hover:text-primary hover:underline transition-colors"
              >
                ติดตามพัสดุโดยไม่ต้องเข้าระบบ
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
