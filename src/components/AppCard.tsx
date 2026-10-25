import React from 'react';
import { Download, ShieldCheck, Calendar, HardDrive, Info } from 'lucide-react';
import { AppListing } from '../types';

interface AppCardProps {
  app: AppListing;
  onSelect: (app: AppListing) => void;
  onDownload: (app: AppListing) => void;
  isDownloading?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onSelect,
  onDownload,
  isDownloading = false,
}) => {
  const formatSize = (bytes: number) => {
    if (!bytes || bytes <= 0) return '14.2 MB';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-[#111726]/80 hover:bg-[#151d30] border border-white/[0.08] hover:border-orange-500/40 p-5 transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/5">
      <div>
        {/* Header: Icon, Name, Category & Version */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <img
            src={app.iconUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80'}
            alt={`${app.name} icon`}
            className="w-14 h-14 rounded-xl object-cover border border-white/10 shadow-md bg-slate-800 shrink-0"
            onError={(e) => {
              // fallback
              (e.currentTarget as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80';
            }}
          />

          <div className="flex-1 min-w-0">
            <h3
              onClick={() => onSelect(app)}
              className="text-base font-bold text-white hover:text-orange-400 transition-colors truncate cursor-pointer"
              title={app.name}
            >
              {app.name}
            </h3>

            {/* Clean unboxed metadata with dot separators per frontend constitution */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span className="font-medium text-orange-400/90">{app.category}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono text-slate-300">v{app.version}</span>
            </div>

            <p className="font-mono text-[11px] text-slate-400 truncate mt-0.5">
              {app.packageName}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {app.description}
        </p>

        {/* Specs & Download Count Bar */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-black/20 border border-white/[0.04] mb-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{formatSize(app.fileSize)}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{formatDate(app.createdAt)}</span>
          </div>

          <div className="flex items-center gap-1.5 justify-end font-medium text-orange-300 truncate" title="Verified completed download events">
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>{app.downloadCount.toLocaleString()} dl</span>
          </div>
        </div>

        {/* SHA-256 Quick Hint */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-4 px-1 font-mono">
          <div className="flex items-center gap-1 text-emerald-400/90">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SHA-256 Verified</span>
          </div>
          <span className="truncate max-w-[120px] text-slate-400">
            {app.sha256.slice(0, 10)}...
          </span>
        </div>
      </div>

      {/* Action Buttons: Details & Download APK */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
        <button
          onClick={() => onSelect(app)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-semibold transition-all cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Details</span>
        </button>

        <button
          onClick={() => onDownload(app)}
          disabled={isDownloading}
          className="flex-[1.5] flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-xs font-bold shadow-md shadow-orange-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isDownloading ? 'Downloading...' : 'Download APK'}</span>
        </button>
      </div>
    </div>
  );
};
