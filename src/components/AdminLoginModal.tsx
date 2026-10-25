import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onSuccess }) => {
  const { signInWithGoogle, user, isAdmin, authError, authorizedEmails } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    const success = await signInWithGoogle();
    setIsAuthenticating(false);
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0e1422] border border-white/10 shadow-2xl p-6 sm:p-7 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/10">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Administrator Authentication
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Secure administrative control portal for publishing and managing Android APK listings.
          </p>
        </div>

        {/* Security Invariant Notice */}
        <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] mb-5 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <Lock className="w-3.5 h-3.5 text-orange-400" />
            <span>Authorized Administrator Identity</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Per system security policy, administrative operations (APK uploads, release updates, deletions) require verified Google OAuth authentication.
          </p>
          <div className="pt-1 text-[11px] font-mono text-orange-300 flex items-center gap-1.5 break-all">
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>{authorizedEmails[0]}</span>
          </div>
        </div>

        {/* Error notification if unauthorized or error occurred */}
        {authError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{authError}</div>
          </div>
        )}

        {/* Already logged in state */}
        {user ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
              <div className="text-slate-400">Signed in as:</div>
              <div className="font-semibold text-white mt-0.5 truncate">{user.email}</div>
              <div className="mt-2 flex items-center gap-1.5">
                {isAdmin ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Authorized Administrator</span>
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1 font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Non-Admin Google Account</span>
                  </span>
                )}
              </div>
            </div>

            {isAdmin ? (
              <button
                onClick={onSuccess}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                <span>Switch to Authorized Admin Account</span>
              </button>
            )}
          </div>
        ) : (
          /* Google Sign In Button */
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isAuthenticating ? 'Authorizing Google Account...' : 'Continue with Google Account'}</span>
            </button>

            <p className="text-[11px] text-center text-slate-400">
              Only authenticated administrator credentials will be granted access.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
