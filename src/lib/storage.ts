/**
 * IndexedDB and LocalStorage persistence for APK binaries and local download history.
 */
import { LocalDownloadRecord } from '../types';

const DB_NAME = 'firechat_apk_platform_db';
const DB_VERSION = 1;
const BINARY_STORE = 'apk_binaries';
const HISTORY_KEY = 'firechat_download_history_v1';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(BINARY_STORE)) {
        db.createObjectStore(BINARY_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function storeApkBinary(appId: string, binary: Uint8Array): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(BINARY_STORE, 'readwrite');
      const store = tx.objectStore(BINARY_STORE);
      const req = store.put(binary, appId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not store in IndexedDB:', err);
  }
}

export async function getApkBinary(appId: string): Promise<Uint8Array | null> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(BINARY_STORE, 'readonly');
      const store = tx.objectStore(BINARY_STORE);
      const req = store.get(appId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteApkBinary(appId: string): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(BINARY_STORE, 'readwrite');
      const store = tx.objectStore(BINARY_STORE);
      const req = store.delete(appId);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    // Ignore error
  }
}

// Local Download History Records
export function getLocalDownloadHistory(): LocalDownloadRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalDownloadRecord(record: LocalDownloadRecord): void {
  try {
    const history = getLocalDownloadHistory();
    // Add to front, deduplicate by idempotencyKey
    const filtered = history.filter((h) => h.idempotencyKey !== record.idempotencyKey);
    filtered.unshift(record);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, 50)));
  } catch (err) {
    console.warn('Failed to save download history:', err);
  }
}

export function clearLocalDownloadHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    // Ignore
  }
}
