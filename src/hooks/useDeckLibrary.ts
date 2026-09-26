import useCachedResource from '@/hooks/useCachedResource';
import { listDecks } from '@/services/backendClient';
import { cacheKeys } from '@/services/dataCache';
import type { Deck } from '../interfaces';

const EMPTY_DECKS: Deck[] = [];

const useDeckLibrary = () => {
  const {
    data: decks,
    isLoading,
    error,
    reload,
  } = useCachedResource({
    cacheKey: cacheKeys.deckLibrary(),
    initialData: EMPTY_DECKS,
    load: listDecks,
    fallbackErrorMessage: 'Could not load the deck library.',
  });

  return {
    decks,
    isLoading,
    error,
    reload,
  };
};

export default useDeckLibrary;
