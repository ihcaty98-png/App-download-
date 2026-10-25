import React, { useState } from 'react';
import {
  X,
  Download,
  ShieldCheck,
  HardDrive,
  Calendar,
  Copy,
  Check,
  Cpu,
  Smartphone,
  Radio,
  Wifi,
  Bell,
  Lock,
  BookOpen,
} from 'lucide-react';
import { AppListing } from '../types';

interface AppDetailsModalProps {
  app: AppListing;
  onClose: () => void;
  onDownload: (app: AppListing) => void;
  onOpenInstallGuide: () => void;
  isDownloading?: boolean;
}

export const AppDetailsModal: React.FC<AppDetailsModalProps> = ({
  app,
  onClose,
  onDownload,
  onOpenInstallGuide,
  isDownloading = false,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);

  const copyChecksum = () => {
    navigator.clipboard.writeText(app.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '14.2 MB';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0e1422] border border-white/10 shadow-2xl p-6 sm:p-7 text-slate-100 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start gap-5 mb-6">
          <img
            src={app.iconUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80'}
            alt={app.name}
            className="w-20 h-20 rounded-2xl object-cover border border-white/10 shadow-xl bg-slate-800 shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {app.name}
            </h2>

            {/* Unboxed metadata per frontend constitution */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1.5">
              <span className="font-semibold text-orange-400">{app.category}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono text-slate-300">v{app.version}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Build code {app.versionCode || 1}</span>
            </div>

            <p className="font-mono text-xs text-slate-400 mt-1">
              Package: <span className="text-slate-300">{app.packageName}</span>
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
              <span className="text-orange-400 font-semibold">
                {app.downloadCount.toLocaleString()} completed download events
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Updated {formatDate(app.updatedAt || app.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Primary Download Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-6">
          <div>
            <div className="text-xs text-slate-400">Direct Android APK Package</div>
            <div className="text-sm font-semibold text-white mt-0.5">
              {formatSize(app.fileSize)} · Universal architecture
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onOpenInstallGuide}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-orange-400" />
              <span>Install Guide</span>
            </button>

            <button
              onClick={() => onDownload(app)}
              disabled={isDownloading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Transferring...' : 'Download APK'}</span>
            </button>
          </div>
        </div>

        {/* SHA-256 Checksum Verification Box */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] mb-6">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Cryptographic Integrity (SHA-256 Checksum)</span>
            </div>
            <button
              onClick={copyChecksum}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {copiedHash ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Hash</span>
                </>
              )}
            </button>
          </div>
          <p className="font-mono text-[11px] text-slate-300 break-all select-all bg-black/30 p-2 rounded-lg border border-white/[0.03]">
            {app.sha256}
          </p>
          <p className="text-[10px] text-slate-400 mt-1.5">
            Verify before installing: Use Android terminal `sha256sum FireChat.apk` or any package inspector to confirm the payload matches bit-for-bit.
          </p>
        </div>

        {/* Technical Specifications */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-slate-400 flex items-center gap-1 mb-1">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Min OS</span>
            </div>
            <div className="font-semibold text-slate-200">{app.minAndroid || 'Android 8.0+'}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-slate-400 flex items-center gap-1 mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Target Arch</span>
            </div>
            <div className="font-semibold text-slate-200">{app.targetArchitecture || 'Universal'}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-slate-400 flex items-center gap-1 mb-1">
              <HardDrive className="w-3.5 h-3.5" />
              <span>Package Size</span>
            </div>
            <div className="font-semibold text-slate-200">{formatSize(app.fileSize)}</div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-slate-400 flex items-center gap-1 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Uploaded</span>
            </div>
            <div className="font-semibold text-slate-200">{formatDate(app.createdAt)}</div>
          </div>
        </div>

        {/* Description & Overview */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Overview
          </h4>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {app.description}
          </p>
        </div>

        {/* Release Notes */}
        {app.releaseNotes && (
          <div className="mb-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">
              What&apos;s New in v{app.version}
            </h4>
            <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-mono">
              {app.releaseNotes}
            </div>
          </div>
        )}

        {/* Declared Android Permissions */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Declared Android Permissions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/20 border border-white/[0.04] text-slate-300">
              <Radio className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>Bluetooth &amp; Mesh Relaying</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/20 border border-white/[0.04] text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>Wi-Fi Direct Peer Connection</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/20 border border-white/[0.04] text-slate-300">
              <Bell className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>Foreground Service &amp; Notifications</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/20 border border-white/[0.04] text-slate-300">
              <Lock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>End-to-End Cryptographic Storage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
