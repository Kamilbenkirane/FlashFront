import useAsyncResource from '@/hooks/useAsyncResource';
import { getCurrentSessionData } from '@/services/backendClient';
import { useCallback, useMemo } from 'react';
import type { SessionData } from '../interfaces';

const EMPTY_SESSION_DATA = null;

const useSessionData = (activeDecksIds: (string | number)[]) => {
  const activeDecksKey = useMemo(
    () => activeDecksIds.map((deckId) => `${deckId}`).join(','),
    [activeDecksIds],
  );
  const normalizedActiveDecksIds = useMemo(
    () => activeDecksIds.map((deckId) => `${deckId}`),
    [activeDecksKey],
  );

  const loadSessionData = useCallback(() => {
    return getCurrentSessionData(normalizedActiveDecksIds);
  }, [normalizedActiveDecksIds]);

  const {
    data: sessionData,
    isLoading,
    error,
    reload,
  } = useAsyncResource<SessionData[] | null>({
    initialData: EMPTY_SESSION_DATA,
    load: loadSessionData,
    fallbackErrorMessage:
      'Could not load this study session. Please try again.',
    enabled: normalizedActiveDecksIds.length > 0,
    initialLoading: false,
    resetDataOnLoad: true,
    resetDataOnError: true,
  });

  return {
    sessionData,
    isLoading,
    error,
    reload,
  };
};

export default useSessionData;
