import { beforeEach, describe, expect, it, vi } from 'vitest';

const { store } = vi.hoisted(() => ({ store: new Map<string, string>() }));

vi.mock('@/services/storage/StorageAdapter', () => ({
  StorageAdapter: class {
    async getString(key: string) {
      return store.get(key) ?? null;
    }
    async setString(key: string, value: string) {
      store.set(key, value);
    }
    async removeString(key: string) {
      store.delete(key);
    }
    async clearAll() {
      store.clear();
    }
  },
}));

import {
  cacheKeys,
  clearDataCache,
  readCachedValue,
  removeCachedValue,
  writeCachedValue,
} from '@/services/dataCache';

describe('dataCache', () => {
  beforeEach(() => {
    store.clear();
  });

  it('returns what was written, as a copy', async () => {
    const decks = [{ deck_id: 1, deck_name: 'Algebra', subject: 'Maths' }];

    await writeCachedValue(cacheKeys.subscribedDecks('user-1'), decks);
    const cached = await readCachedValue<typeof decks>(
      cacheKeys.subscribedDecks('user-1'),
    );

    expect(cached).toEqual(decks);
    expect(cached).not.toBe(decks);
  });

  it('misses when nothing, garbage, an older version or a null value is stored', async () => {
    expect(await readCachedValue('missing')).toBeNull();

    store.set('garbage', '{not json');
    expect(await readCachedValue('garbage')).toBeNull();

    store.set(
      'older',
      JSON.stringify({ version: 0, savedAt: '2026-01-01', value: [1] }),
    );
    expect(await readCachedValue('older')).toBeNull();

    await writeCachedValue('nothing', null);
    expect(await readCachedValue('nothing')).toBeNull();
  });

  it('removes a single entry and clears everything', async () => {
    await writeCachedValue('a', 1);
    await writeCachedValue('b', 2);

    await removeCachedValue('a');
    expect(await readCachedValue('a')).toBeNull();
    expect(await readCachedValue('b')).toBe(2);

    await clearDataCache();
    expect(await readCachedValue('b')).toBeNull();
  });

  it('scopes keys per identity', () => {
    expect(cacheKeys.userProfile('a')).not.toBe(cacheKeys.userProfile('b'));
    expect(cacheKeys.studyCards('a', '1,2')).toBe('study_cards_a_1,2');
    expect(cacheKeys.analytics('a', 'week', 5)).toBe('analytics_a_week_5');
  });
});
