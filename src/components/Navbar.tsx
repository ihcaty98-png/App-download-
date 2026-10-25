import React from 'react';
import {
  Flame,
  Download,
  BookOpen,
  Settings,
  Shield,
  LogOut,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'catalog' | 'history' | 'guide' | 'settings' | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  downloadCount: number;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  downloadCount,
  onOpenAdminLogin,
}) => {
  const { user, isAdmin, signOutUser } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <button
          onClick={() => setActiveTab('catalog')}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-red-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-white/20 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">FireChat</span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                APK
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Official Android Releases</p>
          </div>
        </button>

        {/* Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>APK Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer relative ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Downloads</span>
            {downloadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-white text-orange-600 font-bold">
                {downloadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Install Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Device Specs</span>
          </button>
        </nav>

        {/* Right Action: CEO Socials & Admin portal */}
        <div className="flex items-center gap-2">
          {/* CEO Channels Quick Links */}
          <div className="hidden lg:flex items-center gap-1.5 mr-1">
            <a
              href="https://t.me/+_aoEtf998dM1MjZl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#229ED9]/15 hover:bg-[#229ED9]/25 text-[#40B3E8] border border-[#229ED9]/30 transition-all cursor-pointer"
              title="📢 Join CEO TG Channel"
            >
              <span>📢 TG</span>
            </a>

            <a
              href="https://www.tiktok.com/@firechat_app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/[0.08] transition-all cursor-pointer"
              title="🎵 Join TikTok @firechat_app"
            >
              <span className="text-[#ff0050]">🎵</span>
              <span>TikTok</span>
            </a>
          </div>

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-sm'
                    : 'bg-white/[0.04] text-slate-300 border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-orange-400" />
                <span className="hidden sm:inline">Admin Dashboard</span>
                <span className="sm:hidden">Admin</span>
              </button>

              <button
                onClick={signOutUser}
                title="Sign out administrator"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Admin Access</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden border-t border-white/[0.06] bg-[#090d16] px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[10px] font-medium rounded-lg ${
            activeTab === 'catalog' ? 'text-orange-400' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[10px] font-medium rounded-lg relative ${
            activeTab === 'history' ? 'text-orange-400' : 'text-slate-400'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Downloads</span>
          {downloadCount > 0 && (
            <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-orange-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('guide')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[10px] font-medium rounded-lg ${
            activeTab === 'guide' ? 'text-orange-400' : 'text-slate-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[10px] font-medium rounded-lg ${
            activeTab === 'settings' ? 'text-orange-400' : 'text-slate-400'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Specs</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 text-[10px] font-medium rounded-lg ${
              activeTab === 'admin' ? 'text-orange-400' : 'text-slate-400'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </button>
        )}
      </div>
    </header>
  );
};
