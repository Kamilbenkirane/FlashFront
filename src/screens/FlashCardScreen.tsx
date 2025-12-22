import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DecksMultiSelect from '../components/DecksMultiSelect';
import UsersDropdown from '../components/UsersDropdown';
import { ActionButtons } from '../components/ui/ActionButtons';
import { Card } from '../components/ui/Card';
import { Flashcard } from '../components/ui/Flashcard';
import { LoadingState } from '../components/ui/LoadingState';
import { ProgressBar } from '../components/ui/ProgressBar';
import {
  QuickSettings,
  type SessionSettings,
} from '../components/ui/QuickSettings';
import { Typography } from '../components/ui/Typography';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import createReview from '../functions/createReview';
import useSession from '../hooks/useSession';
import useSessionData from '../hooks/useSessionData';
import useSubscribedDecks from '../hooks/useSubscribedDecks';
import useSyncLocalReviews from '../hooks/useSyncLocalReviews';
import useUsers from '../hooks/useUsers';
import type { User } from '../interfaces';
import type FlashcardModel from '../models/Flashcard';
import type { Theme } from '../theme';

const FlashcardScreen = () => {
  const { theme, isDark } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const users = useUsers();
  const { user, setUser } = useUser();
  const decks = useSubscribedDecks(user);
  const [activeDecksIds, setActiveDecksIds] = useState<(string | number)[]>([]);
  const sessionData = useSessionData(user?.user_id, activeDecksIds);
  const session = useSession(sessionData);
  const [flashcard, setFlashcard] = useState<FlashcardModel | undefined>(
    session?.getNextCard(),
  );
  const [review_count, setReviewCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    known: 0,
  });
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    autoAdvance: false,
    studyMode: 'normal',
    cardsPerSession: 20,
  });

  // Handle navigation parameters for auto-deck selection
  const routeParams = route.params as any;
  const selectedDeckId = routeParams?.selectedDeckId;
  const selectedDeckName = routeParams?.selectedDeckName;
  const autoStart = routeParams?.autoStart;

  useSyncLocalReviews(review_count);

  // Auto-select deck when navigating from Library
  useEffect(() => {
    if (selectedDeckId && autoStart && user && decks.length > 0) {
      const deckExists = decks.some((deck) => deck.deck_id === selectedDeckId);

      if (deckExists) {
        setActiveDecksIds([selectedDeckId]);
        setSessionStats({ correct: 0, incorrect: 0, known: 0 });
        setReviewCount(0);

        navigation.setParams({
          selectedDeckId: undefined,
          selectedDeckName: undefined,
          autoStart: undefined,
        } as any);
      }
    }
  }, [selectedDeckId, autoStart, user, decks, navigation]);

  useEffect(() => {
    const firstCard = session?.getNextCard();
    setFlashcard(firstCard);
  }, [session]);

  const handleUserSelect = (selectedUser: User | null = null) => {
    setUser(selectedUser);
    // Reset session stats when user changes
    setSessionStats({ correct: 0, incorrect: 0, known: 0 });
    setReviewCount(0);
  };

  const handleDeckSelect = (selectedDeckIds: (string | number)[] = []) => {
    setActiveDecksIds(selectedDeckIds);
    // Reset session stats when decks change
    setSessionStats({ correct: 0, incorrect: 0, known: 0 });
    setReviewCount(0);
  };

  const handleButtonPress = async (remembered = true) => {
    if (isProcessing || !flashcard || !session) return;

    setIsProcessing(true);
    const currentFlashcard = flashcard;

    try {
      // Update session stats
      setSessionStats((prev) => ({
        ...prev,
        correct: remembered ? prev.correct + 1 : prev.correct,
        incorrect: remembered ? prev.incorrect : prev.incorrect + 1,
      }));

      // Move to next card
      setFlashcard(session.getNextCard());
      setReviewCount(review_count + 1);

      // Save review
      await createReview(currentFlashcard, remembered, user?.user_id);
      currentFlashcard?.updateCard(remembered);
    } catch (error) {
      console.error('Error processing review:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKnownButtonPress = async () => {
    if (isProcessing || !flashcard || !session) return;

    setIsProcessing(true);
    const currentFlashcard = flashcard;

    try {
      // Update session stats
      setSessionStats((prev) => ({
        ...prev,
        known: prev.known + 1,
      }));

      // Move to next card
      setFlashcard(session.getNextCard());
      setReviewCount(review_count + 1);
      currentFlashcard.streak += 5;

      // Save review
      await createReview(currentFlashcard, true, user?.user_id);
      currentFlashcard?.updateCard(true);
    } catch (error) {
      console.error('Error processing known review:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = createStyles(theme, isDark);

  // Calculate session progress with safe fallbacks
  const totalReviews =
    sessionStats.correct + sessionStats.incorrect + sessionStats.known;
  const accuracy =
    totalReviews > 0
      ? (sessionStats.correct + sessionStats.known) / totalReviews
      : 0;

  // Safe method calls with fallbacks
  let remainingCards = 0;
  let totalCards = 0;
  let completedCards = 0;

  try {
    if (session && typeof session.getRemainingCount === 'function') {
      remainingCards = session.getRemainingCount();
    }
    if (session && typeof session.getTotalCount === 'function') {
      totalCards = session.getTotalCount();
    }
    completedCards = totalCards - remainingCards;
  } catch (error) {
    console.warn('Session method error:', error);
    // Use session data length as fallback
    totalCards = sessionData?.length || 0;
    completedCards = totalReviews;
    remainingCards = Math.max(0, totalCards - completedCards);
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Typography variant="heading2" style={styles.headerTitle}>
          {selectedDeckName && activeDecksIds.length === 1
            ? `Studying: ${selectedDeckName}`
            : 'Study Session'}
        </Typography>
        {user && activeDecksIds.length > 0 && (
          <Pressable
            onPress={() => setShowQuickSettings(true)}
            style={styles.settingsButton}
          >
            <Typography variant="body" style={styles.settingsIcon}>
              ⚙️
            </Typography>
          </Pressable>
        )}
      </View>

      {totalCards > 0 && (
        <ProgressBar
          progress={completedCards}
          total={totalCards}
          showLabel={true}
          showPercentage={true}
          color="primary"
          size="lg"
          className="mt-2"
        />
      )}
    </View>
  );

  const renderSessionStats = () => (
    <Card style={styles.statsCard}>
      <Typography variant="caption" style={styles.statsTitle}>
        Session Stats
      </Typography>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Typography variant="heading3" color="success">
            {sessionStats.correct + sessionStats.known}
          </Typography>
          <Typography variant="caption" color="neutral">
            Correct
          </Typography>
        </View>
        <View style={styles.statItem}>
          <Typography variant="heading3" color="error">
            {sessionStats.incorrect}
          </Typography>
          <Typography variant="caption" color="neutral">
            Incorrect
          </Typography>
        </View>
        <View style={styles.statItem}>
          <Typography variant="heading3" color="primary">
            {`${Math.round(accuracy * 100)}%`}
          </Typography>
          <Typography variant="caption" color="neutral">
            Accuracy
          </Typography>
        </View>
      </View>
    </Card>
  );

  const renderSetupSection = () => (
    <View style={styles.setupSection}>
      <Card style={styles.setupCard}>
        <Typography variant="heading3" style={styles.setupTitle}>
          Setup Study Session
        </Typography>

        <View style={styles.dropdownContainer}>
          <Typography variant="caption" style={styles.dropdownLabel}>
            Select User
          </Typography>
          <UsersDropdown users={users} onSelectUser={handleUserSelect} />
        </View>

        {user && (
          <View style={styles.dropdownContainer}>
            <Typography variant="caption" style={styles.dropdownLabel}>
              Select Decks
            </Typography>
            <DecksMultiSelect decks={decks} onSelectDecks={handleDeckSelect} />
          </View>
        )}
      </Card>
    </View>
  );

  if (!user || activeDecksIds.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderSetupSection()}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!flashcard) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.content}>
          <LoadingState
            message="No more cards to review"
            className="flex-1 justify-center"
          />
          {totalReviews > 0 && renderSessionStats()}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Flashcard */}
        <View style={styles.flashcardContainer}>
          <Flashcard
            flashcard={flashcard}
            style={styles.flashcard}
            testID="study-flashcard"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <ActionButtons
            onForgotten={() => handleButtonPress(false)}
            onRemembered={() => handleButtonPress(true)}
            onKnown={handleKnownButtonPress}
            disabled={isProcessing}
            loading={isProcessing}
            testID="study-actions"
          />
        </View>

        {/* Session Statistics */}
        {totalReviews > 0 && renderSessionStats()}

        {/* Spacing for bottom */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Quick Settings Modal */}
      <QuickSettings
        visible={showQuickSettings}
        onClose={() => setShowQuickSettings(false)}
        sessionSettings={sessionSettings}
        onSettingsChange={setSessionSettings}
        testID="quick-settings"
      />
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
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    headerTitle: {
      textAlign: 'center',
      color: theme.colors.foreground,
      flex: 1,
    },
    settingsButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: `${theme.colors.muted}20`,
    },
    settingsIcon: {
      fontSize: 20,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    flashcardContainer: {
      paddingVertical: theme.spacing.xl,
      alignItems: 'center',
    },
    flashcard: {
      width: '100%',
      maxWidth: 400,
    },
    actionsContainer: {
      paddingVertical: theme.spacing.lg,
    },
    statsCard: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.lg,
    },
    statsTitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      color: theme.colors.muted,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    setupSection: {
      paddingVertical: theme.spacing.xl,
    },
    setupCard: {
      padding: theme.spacing.lg,
    },
    setupTitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      color: theme.colors.foreground,
    },
    dropdownContainer: {
      marginBottom: theme.spacing.lg,
    },
    dropdownLabel: {
      marginBottom: theme.spacing.sm,
      color: theme.colors.muted,
      fontWeight: '600',
    },
    bottomSpacing: {
      height: theme.spacing.xxl,
    },
  });

export default FlashcardScreen;
