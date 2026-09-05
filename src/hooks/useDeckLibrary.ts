import useAsyncResource from '@/hooks/useAsyncResource';
import { listDecks } from '@/services/backendClient';
import type { Deck } from '../interfaces';

const EMPTY_DECKS: Deck[] = [];

const useDeckLibrary = () => {
  const {
    data: decks,
    isLoading,
    error,
    reload,
  } = useAsyncResource({
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
