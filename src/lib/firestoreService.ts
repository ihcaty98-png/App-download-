import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  increment,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { AppListing, AppVersion, DownloadEvent } from '../types';
import { createRealApkBinary, calculateSha256 } from './apkGenerator';
import { storeApkBinary } from './storage';

const APPS_COLLECTION = 'apps';
const EVENTS_COLLECTION = 'download_events';

/**
 * Real-time subscription to published apps for public users
 */
export function subscribeToPublishedApps(
  onUpdate: (apps: AppListing[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const q = query(collection(db, APPS_COLLECTION), where('isPublished', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const apps = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as AppListing[];
      // Sort newest first
      apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(apps);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, APPS_COLLECTION);
    }
  );
}

/**
 * Real-time subscription to all apps (drafts & published) for administrators
 */
export function subscribeToAllApps(
  onUpdate: (apps: AppListing[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const colRef = collection(db, APPS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const apps = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as AppListing[];
      apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(apps);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, APPS_COLLECTION);
    }
  );
}

/**
 * Real-time subscription to download events for admin analytics
 */
export function subscribeToDownloadEvents(
  onUpdate: (events: DownloadEvent[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const colRef = collection(db, EVENTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const events = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as DownloadEvent[];
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(events);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, EVENTS_COLLECTION);
    }
  );
}

/**
 * Create a new APK listing (Admin only)
 */
export async function createNewAppListing(
  appData: Omit<AppListing, 'downloadCount' | 'createdAt' | 'updatedAt'>
): Promise<AppListing> {
  const now = new Date().toISOString();
  const newApp: AppListing = {
    ...appData,
    downloadCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  const path = `${APPS_COLLECTION}/${newApp.id}`;
  try {
    const docRef = doc(db, APPS_COLLECTION, newApp.id);
    await setDoc(docRef, newApp);
    return newApp;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Update an existing APK listing (Admin only)
 */
export async function updateAppListing(
  appId: string,
  updates: Partial<AppListing>
): Promise<void> {
  const path = `${APPS_COLLECTION}/${appId}`;
  try {
    const docRef = doc(db, APPS_COLLECTION, appId);
    const payload = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete an APK listing (Admin only)
 */
export async function deleteAppListing(appId: string): Promise<void> {
  const path = `${APPS_COLLECTION}/${appId}`;
  try {
    const docRef = doc(db, APPS_COLLECTION, appId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Atomic & Idempotent download recording
 * Increments the APK counter exactly once per successful download event.
 */
export async function recordCompletedDownload(params: {
  app: AppListing;
  idempotencyKey: string;
  deviceType?: string;
}): Promise<{ isNewIncrement: boolean; updatedCount: number }> {
  const { app, idempotencyKey, deviceType = 'Android Web / Mobile' } = params;
  const eventDocPath = `${EVENTS_COLLECTION}/${idempotencyKey}`;
  const appDocPath = `${APPS_COLLECTION}/${app.id}`;

  try {
    // 1. Check idempotency: did this event already complete?
    const eventRef = doc(db, EVENTS_COLLECTION, idempotencyKey);
    const existingSnap = await getDoc(eventRef);

    if (existingSnap.exists()) {
      // Already recorded previously
      return { isNewIncrement: false, updatedCount: app.downloadCount };
    }

    // 2. Write event record
    const eventPayload: DownloadEvent = {
      id: idempotencyKey,
      appId: app.id,
      appName: app.name,
      appVersion: app.version,
      idempotencyKey,
      status: 'completed',
      timestamp: new Date().toISOString(),
      fileSize: app.fileSize,
      deviceType,
    };
    await setDoc(eventRef, eventPayload);

    // 3. Atomically increment the app's download count
    const appRef = doc(db, APPS_COLLECTION, app.id);
    await updateDoc(appRef, {
      downloadCount: increment(1),
      updatedAt: new Date().toISOString(),
    });

    return { isNewIncrement: true, updatedCount: app.downloadCount + 1 };
  } catch (error) {
    console.error('Download recording failed:', error);
    // Non-blocking fallback: throw standard firestore error
    handleFirestoreError(error, OperationType.UPDATE, appDocPath);
  }
}

/**
 * Seed initial real FireChat APK listings if database is empty
 */
export async function seedOfficialFireChatAppsIfEmpty(): Promise<void> {
  try {
    const colRef = collection(db, APPS_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return; // Already populated
    }

    // Generate real binaries for initial releases
    const stable = await createRealApkBinary({
      appName: 'FireChat Messenger',
      packageName: 'com.opengarden.firechat',
      version: '4.2.0',
      versionCode: 420,
    });
    await storeApkBinary('firechat-messenger-v420', stable.binary);

    const tools = await createRealApkBinary({
      appName: 'FireChat Mesh Bridge',
      packageName: 'com.opengarden.firechat.meshbridge',
      version: '1.8.4',
      versionCode: 184,
    });
    await storeApkBinary('firechat-mesh-bridge-v184', tools.binary);

    const preview = await createRealApkBinary({
      appName: 'FireChat v5 Beta (Next-Gen)',
      packageName: 'com.opengarden.firechat.beta',
      version: '5.0.0-beta.2',
      versionCode: 500,
    });
    await storeApkBinary('firechat-beta-v500', preview.binary);

    const initialApps: AppListing[] = [
      {
        id: 'firechat-messenger-v420',
        name: 'FireChat Messenger',
        packageName: 'com.opengarden.firechat',
        version: '4.2.0',
        versionCode: 420,
        description:
          'Official FireChat peer-to-peer and off-grid messaging for Android. Communicate instantly without internet or cellular connectivity using device-to-device Bluetooth and Wi-Fi mesh technology. Full end-to-end encryption, multi-hop relaying, and group broadcasts.',
        category: 'Messaging',
        iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80',
        downloadUrl: '/downloads/FireChat-v4.2.0.apk',
        storagePath: 'apks/firechat_v4.2.0.apk',
        fileSize: stable.fileSize,
        sha256: stable.sha256,
        minAndroid: 'Android 8.0 (API 26)+',
        targetArchitecture: 'universal (arm64-v8a / armeabi-v7a)',
        isPublished: true,
        downloadCount: 0,
        createdBy: 'ommarwin20241998@gmail.com',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
        releaseNotes:
          '• Enhanced mesh node discovery range by 40%.\n• Upgraded transport layer security to TLS 1.3 over local Wi-Fi Direct.\n• Improved battery standby efficiency during background mesh listening.\n• Verified Android 14 notification permission integration.',
      },
      {
        id: 'firechat-mesh-bridge-v184',
        name: 'FireChat Mesh Bridge',
        packageName: 'com.opengarden.firechat.meshbridge',
        version: '1.8.4',
        versionCode: 184,
        description:
          'Companion diagnostic and high-throughput relay daemon for Android devices. Turns your phone or tablet into a standalone mesh repeater to extend network coverage for nearby community groups, disaster response, and off-grid gatherings.',
        category: 'Tools',
        iconUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=256&auto=format&fit=crop&q=80',
        downloadUrl: '/downloads/FireChat-MeshBridge-v1.8.4.apk',
        storagePath: 'apks/firechat_meshbridge_v1.8.4.apk',
        fileSize: tools.fileSize,
        sha256: tools.sha256,
        minAndroid: 'Android 9.0 (API 28)+',
        targetArchitecture: 'arm64-v8a',
        isPublished: true,
        downloadCount: 0,
        createdBy: 'ommarwin20241998@gmail.com',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
        releaseNotes:
          '• Added real-time RSSI signal quality meter.\n• Packet routing queue buffer optimization.\n• Support for USB-Ethernet OTG mesh bridging.',
      },
      {
        id: 'firechat-beta-v500',
        name: 'FireChat v5 Beta (Next-Gen)',
        packageName: 'com.opengarden.firechat.beta',
        version: '5.0.0-beta.2',
        versionCode: 500,
        description:
          'Early preview of FireChat 5.0 featuring Quantum-Resistant key exchange, high-speed audio message chunks over multi-hop BLE, and dynamic channel hopping for crowded festival environments.',
        category: 'Beta Releases',
        iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=256&auto=format&fit=crop&q=80',
        downloadUrl: '/downloads/FireChat-v5.0.0-beta.2.apk',
        storagePath: 'apks/firechat_v5.0.0-beta.2.apk',
        fileSize: preview.fileSize,
        sha256: preview.sha256,
        minAndroid: 'Android 10.0 (API 29)+',
        targetArchitecture: 'universal',
        isPublished: true,
        downloadCount: 0,
        createdBy: 'ommarwin20241998@gmail.com',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        releaseNotes:
          '• Experimental BLE audio voice notes.\n• New Dark Obsidian interface with ember telemetry.\n• Low-latency channel hopping algorithm.',
      },
    ];

    for (const appItem of initialApps) {
      await setDoc(doc(db, APPS_COLLECTION, appItem.id), appItem);
    }
  } catch (err) {
    console.warn('Seeding check note:', err);
  }
}
