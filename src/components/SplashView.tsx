import React, { useEffect } from 'react';
import { Flame, ShieldCheck, Download, Smartphone } from 'lucide-react';

interface SplashViewProps {
  onDismiss: () => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 2400);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b13] px-6 text-center select-none overflow-hidden">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-gradient-to-tr from-orange-600/20 via-red-600/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Fiery Icon Badge */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-red-600 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 ring-1 ring-white/20 animate-pulse">
          <Flame className="w-11 h-11 text-white fill-white" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-700/80 rounded-lg p-1.5 shadow-lg">
          <Smartphone className="w-4 h-4 text-orange-400" />
        </div>
      </div>

      {/* Brand Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
        Fire<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-amber-300">Chat</span>
      </h1>
      <p className="text-sm font-medium text-slate-400 max-w-xs mb-8">
        Official Android APK Download Platform
      </p>

      {/* Security & Verification Markers */}
      <div className="flex items-center gap-4 text-xs text-slate-400 mb-8 border border-white/5 bg-white/[0.03] px-4 py-2 rounded-xl backdrop-blur-sm">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SHA-256 Verified</span>
        </div>
        <span className="text-slate-600">·</span>
        <div className="flex items-center gap-1.5 text-orange-300">
          <Download className="w-3.5 h-3.5" />
          <span>Atomic Counter</span>
        </div>
      </div>

      {/* Action to skip or enter */}
      <button
        onClick={onDismiss}
        className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10"
      >
        Tap to enter catalog
      </button>

      {/* Loading bar */}
      <div className="w-48 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full animate-[progress_2.4s_ease-in-out]" />
      </div>
    </div>
  );
};
