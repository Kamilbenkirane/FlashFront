import { StorageAdapter } from '@/services/storage/StorageAdapter';

const studySessionStorage = new StorageAdapter(
  'study-session-storage',
  'flashfront-study-session-2026',
);

const getLastStudiedDeckIdsKey = (identityId: string) =>
  `last_studied_deck_ids_${identityId}`;

const isDeckId = (value: unknown): value is string | number =>
  typeof value === 'string' || typeof value === 'number';

export const normalizeStudyDeckIds = (
  deckIds: readonly (string | number)[],
): string[] => Array.from(new Set(deckIds.map((deckId) => `${deckId}`)));

const parseStoredDeckIds = (stored: string): string[] => {
  const parsed = JSON.parse(stored) as unknown;

  if (Array.isArray(parsed)) {
    return normalizeStudyDeckIds(parsed.filter(isDeckId));
  }

  return [];
};

export const getLastStudiedDeckIds = async (
  identityId: string,
): Promise<string[]> => {
  const stored = await studySessionStorage.getString(
    getLastStudiedDeckIdsKey(identityId),
  );

  return stored ? parseStoredDeckIds(stored) : [];
};

export const saveLastStudiedDeckIds = async (
  identityId: string,
  deckIds: readonly (string | number)[],
) => {
  await studySessionStorage.setString(
    getLastStudiedDeckIdsKey(identityId),
    JSON.stringify(normalizeStudyDeckIds(deckIds)),
  );
};

export const clearLastStudiedDeckIds = async (identityId: string) => {
  await studySessionStorage.removeString(getLastStudiedDeckIdsKey(identityId));
};

export const filterSavedStudyDeckIds = (
  savedDeckIds: readonly (string | number)[],
  availableDeckIds: readonly (string | number)[],
): string[] => {
  const availableDeckIdSet = new Set(normalizeStudyDeckIds(availableDeckIds));

  return normalizeStudyDeckIds(savedDeckIds).filter((deckId) =>
    availableDeckIdSet.has(deckId),
  );
};

export const shouldRestoreLastStudiedDeckIds = ({
  routeSelectedDeckId,
  autoStart,
}: {
  routeSelectedDeckId?: string | number;
  autoStart?: boolean;
}) => !(routeSelectedDeckId !== undefined && autoStart === true);
