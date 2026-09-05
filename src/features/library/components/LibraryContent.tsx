import { FeedbackState } from '@/components/ui/FeedbackState/FeedbackState';
import { LoadingState } from '@/components/ui/LoadingState';
import { DeckCard } from '@/features/library/components/DeckCard';
import useTabScreenSpacing from '@/hooks/useTabScreenSpacing';
import type { Deck } from '@/interfaces';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

export type LibraryBodyState =
  | 'loading'
  | 'libraryError'
  | 'subscriptionError'
  | 'empty'
  | 'filteredEmpty'
  | 'ready';

interface LibraryContentProps {
  header: React.ReactElement;
  bodyState: LibraryBodyState;
  filteredDecks: Deck[];
  libraryError: string | null;
  subscribedDecksError: string | null;
  showSubscribedOnly: boolean;
  pendingDeckId: string | number | null;
  reloadLibrary: () => Promise<void>;
  reloadSubscribedDecks: () => Promise<void>;
  isSubscribed: (deck: Deck) => boolean;
  onSubscriptionToggle: (deck: Deck, subscribe: boolean) => Promise<boolean>;
  onDeckPress: (deck: Deck) => void;
  onClearFilters: () => void;
}

export const LibraryContent: React.FC<LibraryContentProps> = ({
  header,
  bodyState,
  filteredDecks,
  libraryError,
  subscribedDecksError,
  showSubscribedOnly,
  pendingDeckId,
  reloadLibrary,
  reloadSubscribedDecks,
  isSubscribed,
  onSubscriptionToggle,
  onDeckPress,
  onClearFilters,
}) => {
  const { scrollContentContainerStyle, scrollIndicatorInsets } =
    useTabScreenSpacing();
  let emptyState: React.ReactNode = null;

  switch (bodyState) {
    case 'loading':
      emptyState = <LoadingState message="Loading decks…" />;
      break;
    case 'libraryError':
      emptyState = (
        <FeedbackState
          title="Couldn't load decks"
          description={libraryError ?? undefined}
          icon="cloudOff"
          actionLabel="Try again"
          onAction={() => void reloadLibrary()}
        />
      );
      break;
    case 'subscriptionError':
      emptyState = (
        <FeedbackState
          title="Couldn't load added decks"
          description={subscribedDecksError ?? undefined}
          icon="cloudOff"
          actionLabel="Try again"
          onAction={() => void reloadSubscribedDecks()}
        />
      );
      break;
    case 'empty':
      emptyState = (
        <FeedbackState
          title="No decks available"
          description="Shared decks will appear here."
          icon="library"
        />
      );
      break;
    case 'filteredEmpty':
      emptyState = (
        <FeedbackState
          title="No decks found"
          description={
            showSubscribedOnly
              ? 'Add a deck or clear the current filters.'
              : 'Try another search or clear the filters.'
          }
          icon={showSubscribedOnly ? 'layers' : 'search'}
          actionLabel="Show all decks"
          onAction={onClearFilters}
        />
      );
      break;
    case 'ready':
      break;
  }

  return (
    <FlatList
      data={bodyState === 'ready' ? filteredDecks : []}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.stateContainer}>{emptyState}</View>
      }
      renderItem={({ item: deck }) => (
        <DeckCard
          deck={deck}
          isSubscribed={isSubscribed(deck)}
          isSubscriptionPending={pendingDeckId === deck.deck_id}
          onSubscriptionToggle={onSubscriptionToggle}
          onPress={onDeckPress}
          testID={`deck-card-${deck.deck_id}`}
        />
      )}
      keyExtractor={(item) => item.deck_id.toString()}
      contentContainerStyle={[
        { paddingHorizontal: theme.spacing.lg },
        scrollContentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      scrollIndicatorInsets={scrollIndicatorInsets}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  stateContainer: { minHeight: 200, justifyContent: 'center' },
  separator: { height: theme.spacing.sm },
});
