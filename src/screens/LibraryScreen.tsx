import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Alert, Dimensions, FlatList, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import UsersDropdown from '../components/UsersDropdown';
import { Card } from '../components/ui/Card';
import { DeckCard } from '../components/ui/DeckCard';
import { FilterBar } from '../components/ui/FilterBar';
import { LoadingState } from '../components/ui/LoadingState';
import { SearchBar } from '../components/ui/SearchBar';
import { Typography } from '../components/ui/Typography';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import createSubscription from '../functions/createSubscription';
import deleteSubscription from '../functions/deleteSubscription';
import useDeckLibrary from '../hooks/useDeckLibrary';
import useSubscribedDecks from '../hooks/useSubscribedDecks';
import useUsers from '../hooks/useUsers';
import type { Deck, User } from '../interfaces';
import type { Theme } from '../theme';

const LibraryScreen = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const users = useUsers();
  const { user, setUser } = useUser();
  const subscribedDecks = useSubscribedDecks(user);
  const library = useDeckLibrary();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showSubscribedOnly, setShowSubscribedOnly] = useState(false);

  const handleUserSelect = (selectedUser: User | null = null) => {
    setUser(selectedUser);
  };

  // Get unique subjects from library
  const subjects = useMemo(() => {
    const subjectSet = new Set(library.map((deck) => deck.subject));
    return Array.from(subjectSet).sort();
  }, [library]);

  // Filter and search decks
  const filteredDecks = useMemo(() => {
    let filtered = library;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (deck) =>
          deck.deck_name.toLowerCase().includes(query) ||
          deck.subject.toLowerCase().includes(query),
      );
    }

    // Filter by subject
    if (selectedSubject) {
      filtered = filtered.filter((deck) => deck.subject === selectedSubject);
    }

    // Filter by subscription status
    if (showSubscribedOnly) {
      const subscribedDeckIds = new Set(subscribedDecks.map((d) => d.deck_id));
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
      Alert.alert('Error', 'Please select a user first');
      return;
    }

    try {
      const updatedUser: User = {
        ...user,
        iteration: (user.iteration ?? 0) + 1,
      };

      if (subscribe) {
        await createSubscription(updatedUser, deck);
      } else {
        await deleteSubscription(updatedUser, deck);
      }

      setUser(updatedUser);
    } catch (error) {
      Alert.alert('Error', 'Failed to update subscription');
      console.error('Subscription error:', error);
    }
  };

  const handleDeckPress = (deck: Deck) => {
    if (!user) {
      Alert.alert(
        'Select User',
        'Please select a user first to start studying this deck.',
      );
      return;
    }

    const subscribed = isSubscribed(deck);

    if (!subscribed) {
      Alert.alert(
        'Subscribe First',
        `You need to subscribe to "${deck.deck_name}" before studying it.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Subscribe & Study',
            onPress: async () => {
              await handleSubscriptionToggle(deck, true);
              setTimeout(() => {
                (navigation as any).navigate('Flashcard', {
                  selectedDeckId: deck.deck_id,
                  selectedDeckName: deck.deck_name,
                  autoStart: true,
                });
              }, 500);
            },
          },
        ],
      );
      return;
    }

    (navigation as any).navigate('Flashcard', {
      selectedDeckId: deck.deck_id,
      selectedDeckName: deck.deck_name,
      autoStart: true,
    });
  };

  const isSubscribed = (deck: Deck): boolean => {
    return subscribedDecks.some((d) => d.deck_id === deck.deck_id);
  };

  // Calculate grid layout
  const screenWidth = Dimensions.get('window').width;
  const padding = 16;
  const cardWidth = (screenWidth - padding * 3) / 2; // 2 columns
  const numColumns = 2;

  const renderDeckCard = ({ item: deck }) => (
    <View style={{ width: cardWidth }}>
      <DeckCard
        deck={deck}
        isSubscribed={isSubscribed(deck)}
        onSubscriptionToggle={handleSubscriptionToggle}
        onPress={handleDeckPress}
        testID={`deck-card-${deck.deck_id}`}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Typography variant="heading2" style={styles.headerTitle}>
        Deck Library
      </Typography>

      {/* User Selection */}
      <Card style={styles.userSelectionCard}>
        <Typography variant="caption" style={styles.sectionLabel}>
          Select User
        </Typography>
        <UsersDropdown users={users} onSelectUser={handleUserSelect} />
      </Card>
    </View>
  );

  const renderSearchAndFilters = () => (
    <>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search decks..."
          testID="library-search"
        />
      </View>

      {/* Filter Bar */}
      <FilterBar
        subjects={subjects}
        selectedSubject={selectedSubject}
        onSubjectSelect={setSelectedSubject}
        showSubscribedOnly={showSubscribedOnly}
        onToggleSubscribed={() => setShowSubscribedOnly(!showSubscribedOnly)}
        testID="library-filters"
      />
    </>
  );

  const renderEmptyState = () => {
    if (!user) {
      return (
        <LoadingState
          message="Please select a user to view the library"
          className="flex-1 justify-center"
        />
      );
    }

    if (library.length === 0) {
      return (
        <LoadingState
          message="No decks available"
          className="flex-1 justify-center"
        />
      );
    }

    if (filteredDecks.length === 0) {
      return (
        <LoadingState
          message="No decks match your search criteria"
          className="flex-1 justify-center"
        />
      );
    }

    return null;
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <Typography variant="caption" style={styles.statsText}>
        {filteredDecks.length} of {library.length} decks •{' '}
        {subscribedDecks.length} subscribed
      </Typography>
    </View>
  );

  const styles = createStyles(theme, isDark);

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      {user && (
        <>
          {renderSearchAndFilters()}
          {renderStats()}
        </>
      )}

      {renderEmptyState() || (
        <FlatList
          data={filteredDecks}
          renderItem={renderDeckCard}
          keyExtractor={(item) => item.deck_id.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      color: theme.colors.foreground,
    },
    userSelectionCard: {
      padding: theme.spacing.md,
    },
    sectionLabel: {
      marginBottom: theme.spacing.sm,
      color: theme.colors.muted,
      fontWeight: '600',
    },
    searchContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    statsContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    statsText: {
      color: theme.colors.muted,
      textAlign: 'center',
    },
    gridContainer: {
      padding: theme.spacing.sm,
    },
    row: {
      justifyContent: 'space-around',
    },
    separator: {
      height: theme.spacing.sm,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
    },
  });

export default LibraryScreen;
