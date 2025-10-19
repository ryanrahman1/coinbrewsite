import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "coinbrew-cache";
const DB_VERSION = 1;
const STORE_NAME = "cache-store";
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours

interface CacheItem<T> {
  key: string;
  data: T;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

/**
 * Initialize IndexedDB (singleton pattern)
 */
async function initDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Store data in cache with a timestamp
 */
export async function setCache<T>(key: string, data: T): Promise<void> {
  const db = await initDB();
  const item: CacheItem<T> = { key, data, timestamp: Date.now() };
  await db.put(STORE_NAME, item);
}

/**
 * Retrieve data from cache if valid and not expired
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const db = await initDB();
  const item = (await db.get(STORE_NAME, key)) as CacheItem<T> | undefined;

  if (!item) return null;

  const expired = Date.now() - item.timestamp > CACHE_DURATION;
  if (expired) {
    await db.delete(STORE_NAME, key);
    return null;
  }

  return item.data;
}

/**
 * Clear the entire cache store
 */
export async function clearCache(): Promise<void> {
  const db = await initDB();
  await db.clear(STORE_NAME);
}

/**
 * Refresh all caches (used after buy/sell or user actions)
 */
export async function refreshCache(fetchFns: Array<() => Promise<unknown>>): Promise<void> {
  await clearCache();
  for (const fn of fetchFns) {
    await fn();
  }
}

/**
 * Preload essential data (e.g., on login)
 */
export async function preloadCache(fetchFns: Array<() => Promise<unknown>>): Promise<void> {
  for (const fn of fetchFns) {
    await fn();
  }
}

/**
 * Universal cache fetch handler.
 * Checks cache, fetches if missing or expired, then caches result.
 * 
 * @param key - unique cache key
 * @param fetchFn - async function that fetches data
 */
export async function cacheFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached) return cached;

  const data = await fetchFn();
  await setCache(key, data);
  return data;
}
