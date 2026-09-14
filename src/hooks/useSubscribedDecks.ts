import useCachedResource from '@/hooks/useCachedResource';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/providers/UserProvider';
import { listCurrentUserDecks } from '@/services/backendClient';
import { cacheKeys } from '@/services/dataCache';
import type { Deck } from '../interfaces';

const EMPTY_DECKS: Deck[] = [];

const useSubscribedDecks = () => {
  const { authUser } = useAuth();
  const { user } = useUser();
  const identityId = authUser?.id ?? null;
  const {
    data: decks,
    isLoading,
    isRefreshing,
    hasLoaded,
    error,
    reload,
  } = useCachedResource({
    cacheKey: identityId ? cacheKeys.subscribedDecks(identityId) : null,
    initialData: EMPTY_DECKS,
    load: listCurrentUserDecks,
    fallbackErrorMessage: 'Could not load your subscriptions.',
    enabled: Boolean(user),
  });

  return {
    decks,
    isLoading,
    isRefreshing,
    hasLoaded,
    error,
    reload,
  };
};

export default useSubscribedDecks;
