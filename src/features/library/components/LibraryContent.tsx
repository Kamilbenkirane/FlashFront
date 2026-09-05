import { FeedbackState } from '@/components/ui/FeedbackState/FeedbackState';
import { LoadingState } from '@/components/ui/LoadingState';
import { DeckCard } from '@/features/library/components/DeckCard';
import useTabScreenSpacing from '@/hooks/useTabScreenSpacing';
import type { Deck } from '@/interfaces';
import { theme } from '@/tokens/theme';
import { MotiView } from 'moti';
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
}

export const LibraryContent: React.FC<LibraryContentProps> = ({
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
}) => {
  const {
    bottomSpacing,
    scrollContentContainerStyle,
    scrollIndicatorInsets,
    viewportOffsetStyle,
  } = useTabScreenSpacing();
  const stateContainerStyle = [
    styles.stateContainer,
    viewportOffsetStyle,
    { paddingBottom: bottomSpacing },
  ];

  const renderDeckCard = ({
    item: deck,
    index,
  }: {
    item: Deck;
    index: number;
  }) => (
    <MotiView
      style={{ width: cardWidth, maxWidth: '100%' }}
      from={{ opacity: 0, translateY: 50, scale: 0.9 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{
        type: 'spring',
        delay: index * 100,
        damping: 15,
        stiffness: 200,
      }}
    >
      <DeckCard
        deck={deck}
        isSubscribed={isSubscribed(deck)}
        isSubscriptionPending={pendingDeckId === deck.deck_id}
        onSubscriptionToggle={onSubscriptionToggle}
        onPress={onDeckPress}
        testID={`deck-card-${deck.deck_id}`}
      />
    </MotiView>
  );

  switch (bodyState) {
    case 'loading':
      return (
        <View style={stateContainerStyle}>
          <LoadingState
            message="Loading deck library..."
            className="flex-1 justify-center"
          />
        </View>
      );
    case 'libraryError':
      return (
        <View style={stateContainerStyle}>
          <FeedbackState
            title="Couldn't load the deck library"
            description={libraryError ?? undefined}
            icon="cloudOff"
            actionLabel="Retry"
            onAction={() => void reloadLibrary()}
          />
        </View>
      );
    case 'subscriptionError':
      return (
        <View style={stateContainerStyle}>
          <FeedbackState
            title="Couldn't load subscriptions"
            description={subscribedDecksError ?? undefined}
            icon="cloudOff"
            actionLabel="Retry"
            onAction={() => void reloadSubscribedDecks()}
          />
        </View>
      );
    case 'empty':
      return (
        <View style={stateContainerStyle}>
          <FeedbackState
            title="No decks available"
            description="The shared deck library is empty right now."
            icon="library"
          />
        </View>
      );
    case 'filteredEmpty':
      return (
        <View style={stateContainerStyle}>
          <FeedbackState
            title="No decks match your filters"
            description={
              showSubscribedOnly
                ? 'Try turning off the subscribed-only filter or subscribe to more decks.'
                : 'Try a different search term or clear the current subject filter.'
            }
            icon="search"
          />
        </View>
      );
    case 'ready':
      return (
        <FlatList
          key={`library-grid-${numColumns}`}
          style={viewportOffsetStyle}
          data={filteredDecks}
          renderItem={renderDeckCard}
          keyExtractor={(item) => item.deck_id.toString()}
          numColumns={numColumns}
          contentContainerStyle={[
            styles.gridContainer,
            { paddingHorizontal: gridHorizontalPadding },
            scrollContentContainerStyle,
          ]}
          columnWrapperStyle={
            numColumns > 1
              ? [styles.row, { columnGap: gridColumnGap }]
              : undefined
          }
          showsVerticalScrollIndicator={false}
          scrollIndicatorInsets={scrollIndicatorInsets}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      );
  }
};

const styles = StyleSheet.create({
  stateContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  gridContainer: {
    paddingBottom: theme.spacing.sm,
  },
  row: {
    justifyContent: 'flex-start',
  },
  separator: {
    height: theme.spacing.sm,
  },
});
