import type { AppTabScreenProps } from '@/app/navigation/types';
import { SearchBar } from '@/components/ui/SearchBar';
import { Typography } from '@/components/ui/Typography';
import { FilterBar } from '@/features/library/components/FilterBar';
import {
  type LibraryBodyState,
  LibraryContent,
} from '@/features/library/components/LibraryContent';
import { LibraryHeader } from '@/features/library/components/LibraryHeader';
import useDeckLibrary from '@/hooks/useDeckLibrary';
import useSubscribedDecks from '@/hooks/useSubscribedDecks';
import type { Deck } from '@/interfaces';
import { useUser } from '@/providers/UserProvider';
import {
  createDeckSubscription,
  deleteDeckSubscription,
} from '@/services/subscriptions/subscriptionService';
import { theme } from '@/tokens/theme';
import { showAlert } from '@/utils/showAlert';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type LibraryScreenProps = AppTabScreenProps<'Library'>;

const MIN_LIBRARY_CARD_WIDTH = 160;

const LibraryScreen: React.FC<LibraryScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const { user } = useUser();
  const {
    decks: subscribedDecks,
    isLoading: isSubscribedDecksLoading,
    error: subscribedDecksError,
    reload: reloadSubscribedDecks,
  } = useSubscribedDecks();
  const {
    decks: library,
    isLoading: isLibraryLoading,
    error: libraryError,
    reload: reloadLibrary,
  } = useDeckLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showSubscribedOnly, setShowSubscribedOnly] = useState(false);
  const [pendingDeckId, setPendingDeckId] = useState<string | number | null>(
    null,
  );
  const [subscriptionOverrides, setSubscriptionOverrides] = useState<
    Record<string, boolean>
  >({});

  const remoteSubscribedDeckIds = useMemo(
    () => new Set(subscribedDecks.map((deck) => `${deck.deck_id}`)),
    [subscribedDecks],
  );

  useEffect(() => {
    setPendingDeckId(null);
    setSubscriptionOverrides({});
  }, [user?.user_id]);

  useEffect(() => {
    setSubscriptionOverrides((current) => {
      const remainingEntries = Object.entries(current).filter(
        ([deckId, expectedState]) =>
          remoteSubscribedDeckIds.has(deckId) !== expectedState,
      );

      if (remainingEntries.length === Object.keys(current).length) {
        return current;
      }

      return Object.fromEntries(remainingEntries);
    });
  }, [remoteSubscribedDeckIds]);

  const subjects = useMemo(() => {
    const subjectSet = new Set(library.map((deck) => deck.subject));
    return Array.from(subjectSet).sort();
  }, [library]);

  const filteredDecks = useMemo(() => {
    let filtered = library;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (deck) =>
          deck.deck_name.toLowerCase().includes(query) ||
          deck.subject.toLowerCase().includes(query),
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter((deck) => deck.subject === selectedSubject);
    }

    if (showSubscribedOnly) {
      const subscribedDeckIds = new Set(
        subscribedDecks.map((deck) => deck.deck_id),
      );
      filtered = filtered.filter((deck) => subscribedDeckIds.has(deck.deck_id));
    }

    return filtered;
  }, [
    library,
    searchQuery,
    selectedSubject,
    showSubscribedOnly,
    subscribedDecks,
  ]);

  const handleSubscriptionToggle = async (deck: Deck, subscribe: boolean) => {
    if (!user) {
      showAlert('Session expired', 'Sign in again to manage subscriptions.');
      return false;
    }

    const deckKey = `${deck.deck_id}`;
    setPendingDeckId(deck.deck_id);
    setSubscriptionOverrides((current) => ({
      ...current,
      [deckKey]: subscribe,
    }));

    try {
      if (subscribe) {
        await createDeckSubscription(deck.deck_id);
      } else {
        await deleteDeckSubscription(deck.deck_id);
      }

      await reloadSubscribedDecks();
      return true;
    } catch {
      setSubscriptionOverrides((current) => {
        const next = { ...current };
        delete next[deckKey];
        return next;
      });
      showAlert('Error', 'Failed to update subscription');
      return false;
    } finally {
      setPendingDeckId((current) =>
        current === deck.deck_id ? null : current,
      );
    }
  };

  const isSubscribed = (deck: Deck) => {
    const deckKey = `${deck.deck_id}`;
    if (deckKey in subscriptionOverrides) {
      return subscriptionOverrides[deckKey];
    }

    return remoteSubscribedDeckIds.has(deckKey);
  };

  const openDeckStudy = (deck: Deck) => {
    navigation.navigate('Flashcard', {
      selectedDeckId: deck.deck_id,
      selectedDeckName: deck.deck_name,
      autoStart: true,
    });
  };

  const handleDeckPress = (deck: Deck) => {
    if (isSubscribed(deck)) {
      openDeckStudy(deck);
      return;
    }

    showAlert(
      'Subscribe First',
      `You need to subscribe to "${deck.deck_name}" before studying it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe & Study',
          onPress: async () => {
            const didSubscribe = await handleSubscriptionToggle(deck, true);
            if (didSubscribe) {
              openDeckStudy(deck);
            }
          },
        },
      ],
    );
  };

  let libraryBodyState: LibraryBodyState = 'ready';
  if (isLibraryLoading || (showSubscribedOnly && isSubscribedDecksLoading)) {
    libraryBodyState = 'loading';
  } else if (libraryError) {
    libraryBodyState = 'libraryError';
  } else if (subscribedDecksError) {
    libraryBodyState = 'subscriptionError';
  } else if (library.length === 0) {
    libraryBodyState = 'empty';
  } else if (filteredDecks.length === 0) {
    libraryBodyState = 'filteredEmpty';
  }

  const gridHorizontalPadding =
    width >= 768 ? theme.spacing.xxxl : theme.spacing.xl;
  const gridColumnGap = theme.spacing.md;
  const availableGridWidth = Math.max(
    Math.min(width, 1120) - gridHorizontalPadding * 2,
    0,
  );
  const numColumns = Math.min(
    width >= 820 ? 3 : 2,
    Math.max(
      1,
      Math.floor(
        (availableGridWidth + gridColumnGap) /
          (MIN_LIBRARY_CARD_WIDTH + gridColumnGap),
      ),
    ),
  );
  const cardWidth =
    (availableGridWidth - gridColumnGap * (numColumns - 1)) / numColumns;

  const header = (
    <>
      <LibraryHeader />
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search decks or subjects"
          accessibilityLabel="Search decks"
          testID="library-search"
        />
      </View>
      <FilterBar
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSubjectSelect={setSelectedSubject}
        showSubscribedOnly={showSubscribedOnly}
        onToggleSubscribed={() => setShowSubscribedOnly(!showSubscribedOnly)}
        subscribedCount={subscribedDecks.length}
        testID="library-filters"
      />
      <View style={styles.listHeading}>
        <Typography variant="heading3">
          {selectedSubject ||
            (showSubscribedOnly
              ? 'Made for your next session'
              : 'Explore the collection')}
        </Typography>
        <Typography variant="caption" color="muted">
          {isLibraryLoading || (showSubscribedOnly && isSubscribedDecksLoading)
            ? 'Loading…'
            : `${filteredDecks.length} decks`}
        </Typography>
      </View>
    </>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <View style={styles.content}>
        <LibraryContent
          header={header}
          bodyState={libraryBodyState}
          filteredDecks={filteredDecks}
          libraryError={libraryError}
          subscribedDecksError={subscribedDecksError}
          showSubscribedOnly={showSubscribedOnly}
          pendingDeckId={pendingDeckId}
          cardWidth={cardWidth}
          numColumns={numColumns}
          gridHorizontalPadding={gridHorizontalPadding}
          gridColumnGap={gridColumnGap}
          reloadLibrary={reloadLibrary}
          reloadSubscribedDecks={reloadSubscribedDecks}
          isSubscribed={isSubscribed}
          onSubscriptionToggle={handleSubscriptionToggle}
          onDeckPress={handleDeckPress}
          onClearFilters={() => {
            setSearchQuery('');
            setSelectedSubject(null);
            setShowSubscribedOnly(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    marginBottom: theme.spacing.xl,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  listHeading: {
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});

export default LibraryScreen;
