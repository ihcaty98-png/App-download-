export type AppCategory =
  | 'Messaging'
  | 'Tools'
  | 'Beta Releases'
  | 'Enterprise'
  | 'Add-ons'
  | 'Productivity';

export interface AppListing {
  id: string;
  name: string;
  packageName: string;
  version: string;
  versionCode: number;
  description: string;
  category: AppCategory;
  iconUrl: string;
  downloadUrl?: string;
  storagePath?: string;
  fileSize: number; // in bytes
  sha256: string;
  minAndroid: string;
  targetArchitecture: string;
  isPublished: boolean;
  downloadCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  releaseNotes?: string;
  apkBinaryBase64?: string; // stored for local binary delivery if small, or served via generator
}

export interface AppVersion {
  id: string;
  appId: string;
  version: string;
  versionCode: number;
  downloadUrl?: string;
  fileSize: number;
  sha256: string;
  releaseNotes: string;
  isPublished: boolean;
  createdAt: string;
}

export interface DownloadEvent {
  id: string;
  appId: string;
  appName: string;
  appVersion: string;
  idempotencyKey: string;
  status: 'completed' | 'failed' | 'cancelled';
  timestamp: string;
  fileSize?: number;
  deviceType?: string;
}

export interface LocalDownloadRecord {
  id: string; // event id or local id
  appId: string;
  appName: string;
  version: string;
  packageName: string;
  fileName: string;
  fileSize: number;
  sha256: string;
  downloadedAt: string;
  status: 'completed' | 'failed' | 'in_progress';
  idempotencyKey: string;
  downloadUrl?: string;
}

export interface DownloadProgressState {
  app: AppListing;
  bytesReceived: number;
  totalBytes: number;
  percent: number;
  status: 'idle' | 'downloading' | 'verifying' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  speedKBs: number;
  idempotencyKey: string;
  startTime: number;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}
