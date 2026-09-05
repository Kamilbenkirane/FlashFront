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
  cardWidth: number;
  numColumns: number;
  gridHorizontalPadding: number;
  gridColumnGap: number;
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
  cardWidth,
  numColumns,
  gridHorizontalPadding,
  gridColumnGap,
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
      emptyState = <LoadingState message="Gathering your next discoveries…" />;
      break;
    case 'libraryError':
      emptyState = (
        <FeedbackState
          title="Couldn't load the collection"
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
          title="Couldn't load your decks"
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
          title="The collection is on its way"
          description="There are no shared decks available just yet."
          icon="library"
        />
      );
      break;
    case 'filteredEmpty':
      emptyState = (
        <FeedbackState
          title={
            showSubscribedOnly ? 'Make this space yours' : 'No decks found'
          }
          description={
            showSubscribedOnly
              ? 'Explore the collection or clear your filters to find a deck for your next session.'
              : 'Try another search or explore all subjects.'
          }
          icon={showSubscribedOnly ? 'layers' : 'search'}
          actionLabel="Explore all decks"
          onAction={onClearFilters}
        />
      );
      break;
    case 'ready':
      break;
  }

  return (
    <FlatList
      key={`library-grid-${numColumns}`}
      data={bodyState === 'ready' ? filteredDecks : []}
      ListHeaderComponent={header}
      ListEmptyComponent={
        <View style={styles.stateContainer}>{emptyState}</View>
      }
      renderItem={({ item: deck }) => (
        <View style={{ width: cardWidth, maxWidth: '100%' }}>
          <DeckCard
            deck={deck}
            isSubscribed={isSubscribed(deck)}
            isSubscriptionPending={pendingDeckId === deck.deck_id}
            onSubscriptionToggle={onSubscriptionToggle}
            onPress={onDeckPress}
            testID={`deck-card-${deck.deck_id}`}
          />
        </View>
      )}
      keyExtractor={(item) => item.deck_id.toString()}
      numColumns={numColumns}
      contentContainerStyle={[
        { paddingHorizontal: gridHorizontalPadding },
        scrollContentContainerStyle,
      ]}
      columnWrapperStyle={
        numColumns > 1 ? { columnGap: gridColumnGap } : undefined
      }
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}
      scrollIndicatorInsets={scrollIndicatorInsets}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  stateContainer: { minHeight: 240, justifyContent: 'center' },
  separator: { height: theme.spacing.lg },
});
