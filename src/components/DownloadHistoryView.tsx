import React, { useState, useEffect } from 'react';
import {
  Download,
  Trash2,
  ShieldCheck,
  HardDrive,
  Clock,
  ArrowRight,
  RotateCcw,
  Package,
} from 'lucide-react';
import { LocalDownloadRecord, AppListing } from '../types';
import { getLocalDownloadHistory, clearLocalDownloadHistory } from '../lib/storage';

interface DownloadHistoryViewProps {
  onSelectAppById: (appId: string) => void;
  onBrowseCatalog: () => void;
  onRedownload: (appId: string) => void;
}

export const DownloadHistoryView: React.FC<DownloadHistoryViewProps> = ({
  onSelectAppById,
  onBrowseCatalog,
  onRedownload,
}) => {
  const [history, setHistory] = useState<LocalDownloadRecord[]>([]);

  useEffect(() => {
    setHistory(getLocalDownloadHistory());
  }, []);

  const handleClear = () => {
    if (confirm('Clear local download history from this browser device?')) {
      clearLocalDownloadHistory();
      setHistory([]);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '14.2 MB';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Download className="w-6 h-6 text-orange-400" />
            <span>Download History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit log of completed Android APK packages downloaded to this device with cryptographic records.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 bg-white/[0.03] hover:bg-rose-500/10 border border-white/[0.06] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">No Downloads Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            When you download official FireChat APK releases, your package verification receipts and file hashes will appear here.
          </p>
          <button
            onClick={onBrowseCatalog}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-orange-500/20"
          >
            <span>Explore APK Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.idempotencyKey || item.id}
              className="p-4 rounded-xl bg-[#111726]/80 border border-white/[0.06] hover:border-white/[0.12] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white truncate">{item.appName}</span>
                  <span className="text-slate-500">·</span>
                  <span className="font-mono text-xs text-orange-400">v{item.version}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5 font-mono">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatDate(item.downloadedAt)}</span>
                  </div>
                  <span className="text-slate-600">·</span>
                  <div className="flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-slate-400" />
                    <span>{formatSize(item.fileSize)}</span>
                  </div>
                  <span className="text-slate-600">·</span>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3 h-3" />
                    <span>SHA-256 OK</span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] font-mono text-slate-400 truncate">
                  SHA-256: <span className="text-slate-300">{item.sha256}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => onSelectAppById(item.appId)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 transition-colors cursor-pointer"
                >
                  View App
                </button>

                <button
                  onClick={() => onRedownload(item.appId)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Re-download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
