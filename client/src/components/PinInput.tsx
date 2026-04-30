import React from 'react';

interface PinInputProps {
  pin: string;
  setPin: (pin: string) => void;
  className?: string;
}

export default function PinInput({ pin, setPin, className = '' }: PinInputProps) {
  return (
    <div className={`bg-error/5 rounded-2xl p-4 md:p-5 border border-error/20 ${className}`}>
      <label className="text-sm font-bold text-error flex items-center gap-1.5 mb-2">
        <span className="material-symbols-outlined text-[18px]">lock</span>
        รหัส PIN ประจำสาขา
      </label>
      <input
        type="password"
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        placeholder="กรอกรหัส 4 หลัก"
        className="w-full h-12 bg-white border border-error/20 rounded-xl px-4 text-center tracking-[0.5em] text-xl font-bold font-mono focus:border-error focus:ring-2 focus:ring-error/20 outline-none transition-all placeholder:tracking-normal placeholder:text-sm placeholder:font-sans placeholder:font-normal"
      />
    </div>
  );
}
