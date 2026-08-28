import type { AppState, SavedReconciliation } from './types';

const DATABASE = 'payout-reconciliation-explainer';
const VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('draft')) db.createObjectStore('draft');
      if (!db.objectStoreNames.contains('history')) db.createObjectStore('history', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('presets')) db.createObjectStore('presets', { keyPath: 'name' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDraft(state: AppState): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction('draft', 'readwrite');
  transaction.objectStore('draft').put(state, 'current');
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function loadDraft(): Promise<AppState | undefined> {
  const db = await openDb();
  const result = await requestResult(db.transaction('draft').objectStore('draft').get('current')) as AppState | undefined;
  db.close();
  return result;
}

export async function clearDraft(): Promise<void> {
  const db = await openDb();
  await requestResult(db.transaction('draft', 'readwrite').objectStore('draft').delete('current'));
  db.close();
}

export async function saveHistory(item: SavedReconciliation): Promise<void> {
  const db = await openDb();
  await requestResult(db.transaction('history', 'readwrite').objectStore('history').put(item));
  db.close();
}

export async function loadHistory(): Promise<SavedReconciliation[]> {
  const db = await openDb();
  const items = await requestResult(db.transaction('history').objectStore('history').getAll()) as SavedReconciliation[];
  db.close();
  return items.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export async function deleteHistory(id: string): Promise<void> {
  const db = await openDb();
  await requestResult(db.transaction('history', 'readwrite').objectStore('history').delete(id));
  db.close();
}

export async function savePreset(name: string, value: unknown): Promise<void> {
  const db = await openDb();
  await requestResult(db.transaction('presets', 'readwrite').objectStore('presets').put({ name, value, savedAt: new Date().toISOString() }));
  db.close();
}

export async function loadPresets(): Promise<{ name: string; value: unknown }[]> {
  const db = await openDb();
  const result = await requestResult(db.transaction('presets').objectStore('presets').getAll()) as { name: string; value: unknown }[];
  db.close();
  return result;
}
