import React, { useState } from 'react';
import {
  X,
  GitBranch,
  Upload,
  CheckCircle2,
  Calendar,
  HardDrive,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { AppListing } from '../types';
import { updateAppListing } from '../lib/firestoreService';
import { createRealApkBinary } from '../lib/apkGenerator';
import { storeApkBinary } from '../lib/storage';

interface VersionManagerModalProps {
  app: AppListing;
  onClose: () => void;
  onSuccess: () => void;
}

export const VersionManagerModal: React.FC<VersionManagerModalProps> = ({
  app,
  onClose,
  onSuccess,
}) => {
  const [newVersion, setNewVersion] = useState('');
  const [newVersionCode, setNewVersionCode] = useState(
    (app.versionCode || 100) + 10
  );
  const [releaseNotes, setReleaseNotes] = useState('');
  const [isBumping, setIsBumping] = useState(false);

  const handleBumpVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersion.trim()) return alert('New version string is required (e.g. 4.3.0)');

    setIsBumping(true);
    try {
      // Build updated real binary
      const built = await createRealApkBinary({
        appName: app.name,
        packageName: app.packageName,
        version: newVersion,
        versionCode: Number(newVersionCode),
      });

      // Save binary
      await storeApkBinary(app.id, built.binary);

      // Update app record with new version & notes
      await updateAppListing(app.id, {
        version: newVersion,
        versionCode: Number(newVersionCode),
        sha256: built.sha256,
        fileSize: built.fileSize,
        releaseNotes: releaseNotes || `• Released version ${newVersion}`,
      });

      alert(`Successfully bumped ${app.name} to v${newVersion}!`);
      onSuccess();
    } catch (err: unknown) {
      alert('Error bumping version: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsBumping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0e1422] border border-white/10 shadow-2xl p-6 sm:p-7 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
            <GitBranch className="w-4 h-4" />
            <span>Version Release Management</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Manage {app.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Current active production release: <span className="font-mono text-orange-400 font-bold">v{app.version}</span> (code {app.versionCode || 1})
          </p>
        </div>

        {/* Bump version form */}
        <form onSubmit={handleBumpVersion} className="space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>Deploy New Version Release</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  New Version String
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4.4.0"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  className="w-full bg-[#111726] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Build Code (Integer)
                </label>
                <input
                  type="number"
                  required
                  value={newVersionCode}
                  onChange={(e) => setNewVersionCode(Number(e.target.value))}
                  className="w-full bg-[#111726] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Release Notes / Changelog
              </label>
              <textarea
                rows={3}
                placeholder="• Bluetooth mesh packet routing upgrade&#10;• Security patch for Android 14"
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                className="w-full bg-[#111726] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isBumping}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isBumping ? 'Compiling & Registering...' : 'Deploy Version'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
