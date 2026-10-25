import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  ShieldCheck,
  HardDrive,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { AppListing, AppCategory } from '../types';
import { validateApkFile, createRealApkBinary, calculateSha256 } from '../lib/apkGenerator';
import { storeApkBinary } from '../lib/storage';
import { createNewAppListing, updateAppListing } from '../lib/firestoreService';

interface ApkUploadModalProps {
  appToEdit?: AppListing;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApkUploadModal: React.FC<ApkUploadModalProps> = ({
  appToEdit,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(appToEdit?.name || '');
  const [packageName, setPackageName] = useState(appToEdit?.packageName || 'org.firechat.android');
  const [version, setVersion] = useState(appToEdit?.version || '4.3.0');
  const [versionCode, setVersionCode] = useState(appToEdit?.versionCode || 430);
  const [category, setCategory] = useState<AppCategory>(appToEdit?.category || 'Messaging');
  const [description, setDescription] = useState(appToEdit?.description || '');
  const [iconUrl, setIconUrl] = useState(
    appToEdit?.iconUrl ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80'
  );
  const [releaseNotes, setReleaseNotes] = useState(appToEdit?.releaseNotes || '• Initial release with cryptographic mesh networking support.');
  const [isPublished, setIsPublished] = useState(appToEdit?.isPublished ?? false);
  const [minAndroid, setMinAndroid] = useState(appToEdit?.minAndroid || 'Android 8.0 (API 26)+');
  const [targetArch, setTargetArch] = useState(appToEdit?.targetArchitecture || 'universal (arm64-v8a)');

  // File Upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileSha256, setFileSha256] = useState<string>(appToEdit?.sha256 || '');
  const [fileSize, setFileSize] = useState<number>(appToEdit?.fileSize || 0);
  const [isValidatingFile, setIsValidatingFile] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsValidatingFile(true);
    setFileError('');

    try {
      const res = await validateApkFile(file);
      if (!res.isValid) {
        setFileError(res.error || 'Invalid APK file format.');
        setUploadedFile(null);
      } else {
        setUploadedFile(file);
        setFileSha256(res.sha256);
        setFileSize(res.fileSize);
        // If name is empty, suggest based on filename
        if (!name) {
          const cleanName = file.name.replace(/\.apk$/i, '').replace(/[-_]/g, ' ');
          setName(cleanName);
        }
      }
    } catch (err: unknown) {
      setFileError(err instanceof Error ? err.message : 'Error reading file.');
    } finally {
      setIsValidatingFile(false);
    }
  };

  const handleGenerateDefaultApk = async () => {
    setIsValidatingFile(true);
    setFileError('');
    try {
      const res = await createRealApkBinary({
        appName: name || 'FireChat Release',
        packageName: packageName || 'org.firechat.android',
        version: version || '1.0.0',
        versionCode: Number(versionCode) || 1,
      });
      setFileSha256(res.sha256);
      setFileSize(res.fileSize);
      // Create synthetic file
      const syntheticBlob = new Blob([res.binary.buffer as ArrayBuffer], {
        type: 'application/vnd.android.package-archive',
      });
      const synthFile = new File([syntheticBlob], `${name || 'FireChat'}.apk`, {
        type: 'application/vnd.android.package-archive',
      });
      setUploadedFile(synthFile);
    } catch (err) {
      setFileError('Could not generate binary: ' + String(err));
    } finally {
      setIsValidatingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('App name is required');
    if (!packageName.trim()) return alert('Package name is required');
    if (!version.trim()) return alert('Version string is required');
    if (!description.trim()) return alert('Description is required');

    setIsSubmitting(true);
    try {
      const appId =
        appToEdit?.id ||
        `app_${packageName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

      let finalSha256 = fileSha256;
      let finalSize = fileSize;

      // If user uploaded a physical APK file from disk, persist binary to IndexedDB
      if (uploadedFile) {
        const buffer = await uploadedFile.arrayBuffer();
        const binary = new Uint8Array(buffer);
        finalSha256 = await calculateSha256(binary);
        finalSize = binary.length;
        await storeApkBinary(appId, binary);
      } else if (!appToEdit) {
        // Build fresh real APK archive if neither uploaded nor editing
        const built = await createRealApkBinary({
          appName: name,
          packageName,
          version,
          versionCode: Number(versionCode) || 1,
        });
        finalSha256 = built.sha256;
        finalSize = built.fileSize;
        await storeApkBinary(appId, built.binary);
      }

      if (appToEdit) {
        await updateAppListing(appToEdit.id, {
          name,
          packageName,
          version,
          versionCode: Number(versionCode) || 1,
          category,
          description,
          iconUrl,
          releaseNotes,
          isPublished,
          minAndroid,
          targetArchitecture: targetArch,
          fileSize: finalSize,
          sha256: finalSha256,
        });
      } else {
        await createNewAppListing({
          id: appId,
          name,
          packageName,
          version,
          versionCode: Number(versionCode) || 1,
          category,
          description,
          iconUrl,
          releaseNotes,
          isPublished,
          minAndroid,
          targetArchitecture: targetArch,
          fileSize: finalSize,
          sha256: finalSha256,
          downloadUrl: `/downloads/${name.replace(/\s+/g, '_')}-v${version}.apk`,
          storagePath: `apks/${name.toLowerCase().replace(/\s+/g, '_')}.apk`,
          createdBy: 'ommarwin20241998@gmail.com',
        });
      }

      onSuccess();
    } catch (err: unknown) {
      alert('Error saving APK listing: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0e1422] border border-white/10 shadow-2xl p-6 sm:p-7 text-slate-100 my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
            <Upload className="w-4 h-4" />
            <span>{appToEdit ? 'Edit APK Listing' : 'Upload & Publish Android APK'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {appToEdit ? `Edit: ${appToEdit.name}` : 'New Android Application Package'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Server-side verification will validate the binary integrity and register it into the catalog.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* APK File Upload Area */}
          <div className="p-4 rounded-xl bg-black/30 border border-dashed border-white/20 hover:border-orange-500/50 transition-colors">
            <input
              type="file"
              ref={fileInputRef}
              accept=".apk"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {uploadedFile ? uploadedFile.name : appToEdit ? 'Existing APK Package' : 'Upload .apk binary file'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {fileSize > 0 ? (
                      <span className="font-mono text-slate-300">
                        {formatSize(fileSize)} · SHA-256 verified
                      </span>
                    ) : (
                      'Select an APK from your local machine, or generate package'
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="py-2 px-3.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Browse APK
                </button>
                <button
                  type="button"
                  onClick={handleGenerateDefaultApk}
                  className="py-2 px-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-semibold transition-colors cursor-pointer"
                  title="Assemble authentic APK zip package using Android build specifications"
                >
                  Generate APK
                </button>
              </div>
            </div>

            {isValidatingFile && (
              <div className="text-xs text-orange-400 mt-3 animate-pulse">
                Parsing ZIP container headers and computing SHA-256 checksum...
              </div>
            )}

            {fileError && (
              <div className="mt-3 text-xs text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {fileSha256 && (
              <div className="mt-3 p-2 rounded-lg bg-black/40 border border-white/[0.04] text-[11px] font-mono text-slate-300 break-all select-all flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>SHA-256: {fileSha256}</span>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                App Name <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. FireChat Messenger"
                className="w-full bg-[#111726] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AppCategory)}
                className="w-full bg-[#111726] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="Messaging">Messaging</option>
                <option value="Tools">Tools</option>
                <option value="Beta Releases">Beta Releases</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Add-ons">Add-ons</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Android Package Name <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                required
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="e.g. com.opengarden.firechat"
                className="w-full bg-[#111726] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="4.3.0"
                  className="w-full bg-[#111726] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Build Code
                </label>
                <input
                  type="number"
                  required
                  value={versionCode}
                  onChange={(e) => setVersionCode(Number(e.target.value))}
                  placeholder="430"
                  className="w-full bg-[#111726] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                App Icon URL
              </label>
              <input
                type="url"
                value={iconUrl}
                onChange={(e) => setIconUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#111726] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Description <span className="text-orange-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe app capabilities, off-grid mesh protocols, encryption details..."
                className="w-full bg-[#111726] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Release Notes / Changelog
              </label>
              <textarea
                rows={2}
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                placeholder="• Bug fixes and speed improvements..."
                className="w-full bg-[#111726] border border-white/10 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Strict Publishing Toggle */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">Publish to Public Catalog</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                When disabled, this APK remains a private draft visible only to authorized administrators.
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isValidatingFile}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : appToEdit ? 'Save Changes' : isPublished ? 'Publish APK Now' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
