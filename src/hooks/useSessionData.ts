import useCachedResource from '@/hooks/useCachedResource';
import { getCurrentSessionData } from '@/services/backendClient';
import { cacheKeys } from '@/services/dataCache';
import { getPendingReviewMutations } from '@/services/outbox';
import {
  applyReviewsToSessionData,
  buildStudyDeckKey,
  writeStudyCardsSnapshot,
} from '@/services/studyCardsCache';
import { normalizeStudyDeckIds } from '@/services/studySessionStorage';
import { useCallback, useMemo } from 'react';
import type { SessionData } from '../interfaces';

const EMPTY_SESSION_DATA = null;

// The cards of a session are a snapshot taken when it starts: a cached
// snapshot opens instantly and offline, and the fresh server answer only
// updates the cache for the next session so the cards in play never change
// under the user's fingers.
const useSessionData = (
  identityId: string | null,
  activeDecksIds: (string | number)[],
) => {
  const activeDecksKey = useMemo(
    () => activeDecksIds.map((deckId) => `${deckId}`).join(','),
    [activeDecksIds],
  );
  const normalizedActiveDecksIds = useMemo(
    () => normalizeStudyDeckIds(activeDecksIds),
    [activeDecksKey],
  );
  const deckKey = useMemo(
    () => buildStudyDeckKey(normalizedActiveDecksIds),
    [normalizedActiveDecksIds],
  );

  const loadSessionData = useCallback(async () => {
    const cards = await getCurrentSessionData(normalizedActiveDecksIds);
    // Reviews still queued locally are newer than what the server returned.
    const pendingReviews = await getPendingReviewMutations();
    return applyReviewsToSessionData(cards, pendingReviews);
  }, [normalizedActiveDecksIds]);

  const writeSessionCache = useCallback(
    (cards: SessionData[] | null) =>
      identityId && cards
        ? writeStudyCardsSnapshot(identityId, normalizedActiveDecksIds, cards)
        : Promise.resolve(),
    [identityId, normalizedActiveDecksIds],
  );

  const {
    data: sessionData,
    isLoading,
    error,
    reload,
  } = useCachedResource<SessionData[] | null>({
    cacheKey:
      identityId && normalizedActiveDecksIds.length > 0
        ? cacheKeys.studyCards(identityId, deckKey)
        : null,
    initialData: EMPTY_SESSION_DATA,
    load: loadSessionData,
    fallbackErrorMessage:
      'Could not load this study session. Please try again.',
    enabled: normalizedActiveDecksIds.length > 0,
    applyBackgroundRefresh: false,
    writeCache: writeSessionCache,
  });

  return {
    sessionData,
    isLoading,
    error,
    reload,
  };
};

export default useSessionData;
