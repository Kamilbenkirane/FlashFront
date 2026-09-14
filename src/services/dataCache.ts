import { StorageAdapter } from '@/services/storage/StorageAdapter';

// Bump when the shape of a cached value changes so stale entries are ignored.
const CACHE_VERSION = 1;

interface CacheEntry<T> {
  version: number;
  savedAt: string;
  value: T;
}

const dataCache = new StorageAdapter(
  'data-cache-storage',
  'flashfront-data-cache-2026',
);

export const cacheKeys = {
  userProfile: (identityId: string) => `user_profile_${identityId}`,
  subscribedDecks: (identityId: string) => `subscribed_decks_${identityId}`,
  deckLibrary: () => 'deck_library',
  analytics: (identityId: string, range: string, recentLimit: number) =>
    `analytics_${identityId}_${range}_${recentLimit}`,
  studyChatModels: (identityId: string) => `study_chat_models_${identityId}`,
  studyChatImageModels: (identityId: string) =>
    `study_chat_image_models_${identityId}`,
  studyCards: (identityId: string, deckKey: string) =>
    `study_cards_${identityId}_${deckKey}`,
};

const isCacheEntry = <T>(value: unknown): value is CacheEntry<T> =>
  typeof value === 'object' &&
  value !== null &&
  (value as CacheEntry<T>).version === CACHE_VERSION &&
  'value' in value;

// Returns null when nothing usable is stored. A cached `null` value is
// treated as a miss on purpose: callers only cache data worth restoring.
export const readCachedValue = async <T>(key: string): Promise<T | null> => {
  const stored = await dataCache.getString(key);
  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!isCacheEntry<T>(parsed) || parsed.value === null) {
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
};

export const writeCachedValue = async <T>(key: string, value: T) => {
  const entry: CacheEntry<T> = {
    version: CACHE_VERSION,
    savedAt: new Date().toISOString(),
    value,
  };
  await dataCache.setString(key, JSON.stringify(entry));
};

export const removeCachedValue = (key: string) => dataCache.removeString(key);

// Drops every cached server response, e.g. when the account signs out.
export const clearDataCache = () => dataCache.clearAll();
