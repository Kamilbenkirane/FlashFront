import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getStringMock, setStringMock, removeStringMock } = vi.hoisted(() => ({
  getStringMock: vi.fn(),
  setStringMock: vi.fn(),
  removeStringMock: vi.fn(),
}));

vi.mock('@/services/storage/StorageAdapter', () => ({
  StorageAdapter: class {
    getString = getStringMock;
    setString = setStringMock;
    removeString = removeStringMock;
  },
}));

import {
  clearLastStudiedDeckIds,
  filterSavedStudyDeckIds,
  getLastStudiedDeckIds,
  normalizeStudyDeckIds,
  saveLastStudiedDeckIds,
  shouldRestoreLastStudiedDeckIds,
} from '@/services/studySessionStorage';

describe('studySessionStorage', () => {
  beforeEach(() => {
    getStringMock.mockReset();
    setStringMock.mockReset();
    removeStringMock.mockReset();
    getStringMock.mockResolvedValue(null);
  });

  it('normalizes and deduplicates deck ids while preserving order', () => {
    expect(normalizeStudyDeckIds([12, '12', '7', 12, '9'])).toEqual([
      '12',
      '7',
      '9',
    ]);
  });

  it('filters restored deck ids to the currently available subscribed decks', () => {
    expect(
      filterSavedStudyDeckIds(['4', 9, '4', '12'], [9, '12', '18']),
    ).toEqual(['9', '12']);
  });

  it('skips restoring saved decks when a library study launch is in progress', () => {
    expect(
      shouldRestoreLastStudiedDeckIds({
        routeSelectedDeckId: 24,
        autoStart: true,
      }),
    ).toBe(false);

    expect(
      shouldRestoreLastStudiedDeckIds({
        routeSelectedDeckId: 24,
        autoStart: false,
      }),
    ).toBe(true);
  });

  it('stores and reloads last studied deck ids for an identity', async () => {
    let storedValue: string | null = null;

    setStringMock.mockImplementation(async (_key: string, value: string) => {
      storedValue = value;
    });
    getStringMock.mockImplementation(async () => storedValue);

    await saveLastStudiedDeckIds('user-1', [5, '5', 9]);

    expect(setStringMock).toHaveBeenCalledWith(
      'last_studied_deck_ids_user-1',
      JSON.stringify(['5', '9']),
    );

    await expect(getLastStudiedDeckIds('user-1')).resolves.toEqual(['5', '9']);
  });

  it('clears the stored deck selection for an identity', async () => {
    await clearLastStudiedDeckIds('user-1');

    expect(removeStringMock).toHaveBeenCalledWith(
      'last_studied_deck_ids_user-1',
    );
  });
});
