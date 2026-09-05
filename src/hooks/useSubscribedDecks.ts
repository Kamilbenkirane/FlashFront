import useAsyncResource from '@/hooks/useAsyncResource';
import { useUser } from '@/providers/UserProvider';
import { listCurrentUserDecks } from '@/services/backendClient';
import type { Deck } from '../interfaces';

const EMPTY_DECKS: Deck[] = [];

const useSubscribedDecks = () => {
  const { user } = useUser();
  const {
    data: decks,
    isLoading,
    error,
    reload,
  } = useAsyncResource({
    initialData: EMPTY_DECKS,
    load: listCurrentUserDecks,
    fallbackErrorMessage: 'Could not load your subscriptions.',
    enabled: Boolean(user),
    initialLoading: false,
  });

  return {
    decks,
    isLoading,
    error,
    reload,
  };
};

export default useSubscribedDecks;
