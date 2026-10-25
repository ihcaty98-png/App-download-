import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Search,
  Download,
  ShieldCheck,
  Filter,
  Sparkles,
  Smartphone,
  Layers,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { SplashView } from './components/SplashView';
import { AppCard } from './components/AppCard';
import { AppDetailsModal } from './components/AppDetailsModal';
import { DownloadProgressModal } from './components/DownloadProgressModal';
import { DownloadHistoryView } from './components/DownloadHistoryView';
import { InstallGuideModal } from './components/InstallGuideModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ApkUploadModal } from './components/ApkUploadModal';
import { VersionManagerModal } from './components/VersionManagerModal';
import { SettingsView } from './components/SettingsView';
import { CeoChannelsBanner } from './components/CeoChannelsBanner';
import { AppListing, DownloadEvent, AppCategory } from './types';
import {
  subscribeToPublishedApps,
  subscribeToAllApps,
  subscribeToDownloadEvents,
  seedOfficialFireChatAppsIfEmpty,
} from './lib/firestoreService';
import { getLocalDownloadHistory } from './lib/storage';

function MainAppContent() {
  const { user, isAdmin } = useAuth();

  // App navigation state
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalog');

  // Catalog data from real Firestore
  const [apps, setApps] = useState<AppListing[]>([]);
  const [downloadEvents, setDownloadEvents] = useState<DownloadEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'downloads' | 'name'>('downloads');

  // Modals
  const [selectedAppForDetails, setSelectedAppForDetails] = useState<AppListing | null>(null);
  const [appDownloading, setAppDownloading] = useState<AppListing | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [appToUploadOrEdit, setAppToUploadOrEdit] = useState<AppListing | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [appForVersionManager, setAppForVersionManager] = useState<AppListing | null>(null);

  // Local downloads count for navbar badge
  const [localDownloadCount, setLocalDownloadCount] = useState<number>(0);

  // 1. Initial setup & Firestore subscription
  useEffect(() => {
    seedOfficialFireChatAppsIfEmpty().catch((err) => {
      console.warn('Initial seeding note:', err);
    });

    setLocalDownloadCount(getLocalDownloadHistory().length);
  }, []);

  // 2. Real-time apps subscription: Admins get drafts + published; Public gets published only
  useEffect(() => {
    setIsLoading(true);
    let unsubscribe: () => void;

    if (isAdmin) {
      unsubscribe = subscribeToAllApps(
        (data) => {
          setApps(data);
          setIsLoading(false);
          setErrorNotice(null);
        },
        (err) => {
          console.error('All apps subscription error:', err);
          setIsLoading(false);
        }
      );
    } else {
      unsubscribe = subscribeToPublishedApps(
        (data) => {
          setApps(data);
          setIsLoading(false);
          setErrorNotice(null);
        },
        (err) => {
          console.error('Published apps subscription error:', err);
          setIsLoading(false);
        }
      );
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAdmin]);

  // 3. Download events subscription for admin metrics
  useEffect(() => {
    let unsubscribeEvents: (() => void) | undefined;
    if (isAdmin) {
      unsubscribeEvents = subscribeToDownloadEvents(
        (events) => {
          setDownloadEvents(events);
        },
        (err) => {
          console.warn('Download events note:', err);
        }
      );
    }
    return () => {
      if (unsubscribeEvents) unsubscribeEvents();
    };
  }, [isAdmin]);

  // Categories list
  const categories = ['All', 'Messaging', 'Tools', 'Beta Releases', 'Enterprise', 'Add-ons'];

  // Filtered and sorted apps
  const filteredApps = useMemo(() => {
    let result = apps;

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (a) => a.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.packageName.toLowerCase().includes(q) ||
          a.version.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'downloads') {
        return (b.downloadCount || 0) - (a.downloadCount || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [apps, selectedCategory, searchQuery, sortBy]);

  // Total downloads metric across catalog
  const totalCompletedDownloads = useMemo(() => {
    return apps.reduce((sum, a) => sum + (a.downloadCount || 0), 0);
  }, [apps]);

  const handleStartDownload = (app: AppListing) => {
    setAppDownloading(app);
  };

  const handleRedownloadById = (appId: string) => {
    const found = apps.find((a) => a.id === appId);
    if (found) {
      setAppDownloading(found);
    } else {
      alert('This application is no longer active in the published catalog.');
    }
  };

  const handleSelectAppById = (appId: string) => {
    const found = apps.find((a) => a.id === appId);
    if (found) {
      setSelectedAppForDetails(found);
    }
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
      {/* 1. Splash Screen */}
      {showSplash && <SplashView onDismiss={() => setShowSplash(false)} />}

      {/* 2. Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        downloadCount={localDownloadCount}
        onOpenAdminLogin={() => setShowAdminLogin(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: APK Catalog (Home Screen) */}
        {activeTab === 'catalog' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Hero Banner Section */}
            <div className="relative rounded-3xl bg-gradient-to-br from-[#121829] via-[#0f1524] to-[#18111e] border border-white/[0.08] p-6 sm:p-10 mb-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/15 via-red-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">
                  <Flame className="w-4 h-4 fill-orange-400" />
                  <span>Peer-to-Peer Off-Grid Communications</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] mb-3">
                  FireChat Official APK Releases
                </h1>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-w-xl">
                  Download authentic, verified Android APK packages directly to your device. Communicate across off-grid mesh networks with zero cellular infrastructure.
                </p>

                {/* Unboxed Metadata Stats with typographic separators per constitution */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 font-bold text-orange-400">
                    <Download className="w-4 h-4" />
                    <span>{totalCompletedDownloads.toLocaleString()} completed download events</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>All Binaries SHA-256 Verified</span>
                  </div>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <button
                    onClick={() => setShowInstallGuide(true)}
                    className="text-orange-400 hover:text-orange-300 underline underline-offset-4 cursor-pointer font-semibold"
                  >
                    Installation Guide
                  </button>
                </div>
              </div>
            </div>

            {/* CEO Join Channel Banner */}
            <CeoChannelsBanner />

            {/* Search and Category Filters Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
              {/* Category Segmented Controls (Functional buttons per constitution) */}
              <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-2.5">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search apps or versions..."
                    className="w-full bg-[#111726] border border-white/[0.08] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 bg-[#111726] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="downloads">Most Downloaded</option>
                    <option value="newest">Newest First</option>
                    <option value="name">Alphabetical</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Error Notification if any */}
            {errorNotice && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorNotice}</span>
              </div>
            )}

            {/* Apps Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl bg-white/[0.02] border border-white/[0.05] animate-pulse p-5"
                  />
                ))}
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">No Matching APKs Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  No published packages matched your filter query.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredApps.map((app) => (
                  <AppCard
                    key={app.id}
                    app={app}
                    onSelect={(selected) => setSelectedAppForDetails(selected)}
                    onDownload={(selected) => handleStartDownload(selected)}
                    isDownloading={appDownloading?.id === app.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Download History */}
        {activeTab === 'history' && (
          <DownloadHistoryView
            onBrowseCatalog={() => setActiveTab('catalog')}
            onSelectAppById={handleSelectAppById}
            onRedownload={handleRedownloadById}
          />
        )}

        {/* VIEW 3: Installation Guide */}
        {activeTab === 'guide' && (
          <div className="py-6 px-4">
            <InstallGuideModal onClose={() => setActiveTab('catalog')} />
          </div>
        )}

        {/* VIEW 4: Device & System Specs */}
        {activeTab === 'settings' && <SettingsView apps={apps} />}

        {/* VIEW 5: Admin Dashboard */}
        {activeTab === 'admin' && (
          <AdminDashboard
            apps={apps}
            events={downloadEvents}
            onOpenUpload={(editApp) => {
              setAppToUploadOrEdit(editApp);
              setShowUploadModal(true);
            }}
            onOpenVersionManager={(app) => setAppForVersionManager(app)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#070b13] py-7 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Flame className="w-3 h-3 fill-current" />
            </div>
            <span className="font-semibold text-slate-300">FireChat App Download</span>
            <span className="text-slate-600">·</span>
            <span>Production-Ready Android APK Platform</span>
          </div>

          {/* CEO Official Channels in Footer */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-slate-400 font-medium">CEO Channels:</span>
            <a
              href="https://t.me/+_aoEtf998dM1MjZl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#40B3E8] hover:text-[#5bc1f1] font-semibold transition-colors"
            >
              <span>📢 Telegram Channel</span>
            </a>
            <span className="text-slate-600">·</span>
            <a
              href="https://www.tiktok.com/@firechat_app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold transition-colors"
            >
              <span className="text-[#ff0050]">🎵</span>
              <span>TikTok @firechat_app</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Atomic Counter Guaranteed</span>
            <span className="text-slate-600">·</span>
            <span>SHA-256 Validated</span>
          </div>
        </div>
      </footer>

      {/* MODAL 1: App Details */}
      {selectedAppForDetails && (
        <AppDetailsModal
          app={selectedAppForDetails}
          onClose={() => setSelectedAppForDetails(null)}
          onDownload={(app) => {
            setSelectedAppForDetails(null);
            handleStartDownload(app);
          }}
          onOpenInstallGuide={() => setShowInstallGuide(true)}
          isDownloading={appDownloading?.id === selectedAppForDetails.id}
        />
      )}

      {/* MODAL 2: Download Progress & Verification */}
      {appDownloading && (
        <DownloadProgressModal
          app={appDownloading}
          onClose={() => {
            setAppDownloading(null);
            setLocalDownloadCount(getLocalDownloadHistory().length);
          }}
          onOpenInstallGuide={() => setShowInstallGuide(true)}
        />
      )}

      {/* MODAL 3: Install Guide Popup */}
      {showInstallGuide && (
        <InstallGuideModal onClose={() => setShowInstallGuide(false)} />
      )}

      {/* MODAL 4: Admin Google Login */}
      {showAdminLogin && (
        <AdminLoginModal
          onClose={() => setShowAdminLogin(false)}
          onSuccess={() => {
            setShowAdminLogin(false);
            setActiveTab('admin');
          }}
        />
      )}

      {/* MODAL 5: APK Upload & Metadata Editor */}
      {showUploadModal && (
        <ApkUploadModal
          appToEdit={appToUploadOrEdit}
          onClose={() => {
            setShowUploadModal(false);
            setAppToUploadOrEdit(undefined);
          }}
          onSuccess={() => {
            setShowUploadModal(false);
            setAppToUploadOrEdit(undefined);
          }}
        />
      )}

      {/* MODAL 6: Version Release Manager */}
      {appForVersionManager && (
        <VersionManagerModal
          app={appForVersionManager}
          onClose={() => setAppForVersionManager(null)}
          onSuccess={() => setAppForVersionManager(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
