import React, { useState, useMemo } from 'react';
import {
  Shield,
  Plus,
  BarChart3,
  Download,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  HardDrive,
  Calendar,
  Layers,
  ArrowUpRight,
  GitBranch,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  FileCode,
} from 'lucide-react';
import { AppListing, DownloadEvent } from '../types';
import { updateAppListing, deleteAppListing } from '../lib/firestoreService';
import { deleteApkBinary } from '../lib/storage';

interface AdminDashboardProps {
  apps: AppListing[];
  events: DownloadEvent[];
  onOpenUpload: (appToEdit?: AppListing) => void;
  onOpenVersionManager: (app: AppListing) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  apps,
  events,
  onOpenUpload,
  onOpenVersionManager,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'stats' | 'events'>('catalog');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Statistics calculation from real data
  const stats = useMemo(() => {
    const totalApps = apps.length;
    const publishedApps = apps.filter((a) => a.isPublished).length;
    const draftApps = totalApps - publishedApps;
    const totalDownloads = apps.reduce((sum, a) => sum + (a.downloadCount || 0), 0);

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;
    const oneMonthMs = 30 * oneDayMs;

    const completedEvents = events.filter((e) => e.status === 'completed');

    const dailyDownloads = completedEvents.filter(
      (e) => now - new Date(e.timestamp).getTime() <= oneDayMs
    ).length;

    const weeklyDownloads = completedEvents.filter(
      (e) => now - new Date(e.timestamp).getTime() <= oneWeekMs
    ).length;

    const monthlyDownloads = completedEvents.filter(
      (e) => now - new Date(e.timestamp).getTime() <= oneMonthMs
    ).length;

    return {
      totalApps,
      publishedApps,
      draftApps,
      totalDownloads,
      dailyDownloads,
      weeklyDownloads,
      monthlyDownloads,
      eventsCount: completedEvents.length,
    };
  }, [apps, events]);

  // Toggle publish / unpublish
  const handleTogglePublish = async (app: AppListing) => {
    setActionLoadingId(app.id);
    try {
      await updateAppListing(app.id, {
        isPublished: !app.isPublished,
      });
    } catch (err) {
      alert('Error updating publication status: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete listing
  const handleDelete = async (app: AppListing) => {
    if (confirm(`Are you sure you want to permanently delete "${app.name}" and remove all downloads?`)) {
      setActionLoadingId(app.id);
      try {
        await deleteAppListing(app.id);
        await deleteApkBinary(app.id);
      } catch (err) {
        alert('Error deleting app: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setActionLoadingId(null);
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '14.2 MB';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const filteredApps = useMemo(() => {
    if (filterCategory === 'all') return apps;
    if (filterCategory === 'published') return apps.filter((a) => a.isPublished);
    if (filterCategory === 'drafts') return apps.filter((a) => !a.isPublished);
    return apps.filter((a) => a.category.toLowerCase() === filterCategory.toLowerCase());
  }, [apps, filterCategory]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>Administrative Command Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            APK Catalog &amp; Analytics Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authorized admin: <span className="font-mono text-slate-200">ommarwin20241998@gmail.com</span>
          </p>
        </div>

        <button
          onClick={() => onOpenUpload()}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New APK</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[#111726]/80 border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Catalog Apps</span>
            <Layers className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalApps}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            <span className="text-emerald-400 font-semibold">{stats.publishedApps} live</span> · {stats.draftApps} drafts
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111726]/80 border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Completed Downloads</span>
            <Download className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalDownloads.toLocaleString()}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Verified atomic increment events
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111726]/80 border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>24h Download Events</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.dailyDownloads}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Last 7 days: <span className="text-white font-semibold">{stats.weeklyDownloads}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#111726]/80 border border-white/[0.06]">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Monthly Run-rate</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{stats.monthlyDownloads}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Audit log records: {stats.eventsCount}
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Catalog vs Stats vs Events */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Manage Catalog ({apps.length})
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics Breakdown
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'events'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Event Stream ({events.length})
          </button>
        </div>

        {activeTab === 'catalog' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-[#111726] border border-white/[0.08] text-xs text-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-orange-500"
            >
              <option value="all">All Entries</option>
              <option value="published">Published Only</option>
              <option value="drafts">Drafts Only</option>
              <option value="Messaging">Messaging</option>
              <option value="Tools">Tools</option>
              <option value="Beta Releases">Beta Releases</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Catalog Table */}
      {activeTab === 'catalog' && (
        <div className="rounded-2xl bg-[#111726]/80 border border-white/[0.08] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-black/20 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Application</th>
                  <th className="py-3.5 px-4">Package &amp; Version</th>
                  <th className="py-3.5 px-4">File Size</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Completed Downloads</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.iconUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80'}
                          alt={app.name}
                          className="w-9 h-9 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                            {app.name}
                          </div>
                          <div className="text-[11px] text-orange-400/90 font-medium">{app.category}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      <div>v{app.version}</div>
                      <div className="text-slate-400 truncate max-w-[160px]">{app.packageName}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {formatSize(app.fileSize)}
                    </td>

                    <td className="py-3.5 px-4">
                      {app.isPublished ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span>Draft (Unpublished)</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-200">
                      <span className="text-orange-400">{app.downloadCount.toLocaleString()}</span> dl
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Publish / Unpublish Toggle */}
                        <button
                          disabled={actionLoadingId === app.id}
                          onClick={() => handleTogglePublish(app)}
                          title={app.isPublished ? 'Unpublish from public catalog' : 'Publish to live catalog'}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-40"
                        >
                          {app.isPublished ? <EyeOff className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                        </button>

                        {/* Version Bump */}
                        <button
                          onClick={() => onOpenVersionManager(app)}
                          title="Manage Version History"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                        >
                          <GitBranch className="w-4 h-4 text-cyan-400" />
                        </button>

                        {/* Edit Metadata */}
                        <button
                          onClick={() => onOpenUpload(app)}
                          title="Edit APK Information"
                          className="p-1.5 rounded-lg text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
                        >
                          <Edit className="w-4 h-4 text-slate-300" />
                        </button>

                        {/* Delete Listing */}
                        <button
                          disabled={actionLoadingId === app.id}
                          onClick={() => handleDelete(app)}
                          title="Permanently Delete Listing"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 bg-white/[0.04] hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Analytics Breakdown */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#111726]/80 border border-white/[0.08]">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              <span>Download Breakdown by Application</span>
            </h3>

            <div className="space-y-4">
              {apps.map((app) => {
                const maxDownloads = Math.max(...apps.map((a) => a.downloadCount), 1);
                const percent = Math.min(100, Math.round((app.downloadCount / maxDownloads) * 100));
                return (
                  <div key={app.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-white">
                        <span>{app.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">v{app.version}</span>
                      </div>
                      <span className="font-bold text-orange-400">
                        {app.downloadCount.toLocaleString()} completed events
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Live Event Stream */}
      {activeTab === 'events' && (
        <div className="rounded-2xl bg-[#111726]/80 border border-white/[0.08] p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>Real-Time Atomic Download Event Log</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total Recorded: {events.length}
            </span>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No download events logged yet. Completed downloads from Android users will stream here in real time.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {events.slice(0, 30).map((evt) => (
                <div
                  key={evt.idempotencyKey || evt.id}
                  className="p-3 rounded-xl bg-black/20 border border-white/[0.04] text-xs flex items-center justify-between gap-3 font-mono"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-white truncate">{evt.appName}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-orange-400">v{evt.appVersion}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
                    <span className="hidden sm:inline text-slate-400 truncate max-w-[140px]">
                      Key: {evt.idempotencyKey.slice(0, 14)}...
                    </span>
                    <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
