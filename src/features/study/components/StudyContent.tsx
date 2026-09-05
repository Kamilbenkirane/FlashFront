import { Card } from '@/components/ui/Card';
import { FeedbackState } from '@/components/ui/FeedbackState/FeedbackState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Typography } from '@/components/ui/Typography';
import type {
  StudyCard,
  StudyReviewOutcome,
} from '@/domain/study/models/Flashcard';
import DecksMultiSelect from '@/features/library/components/DecksMultiSelect';
import { Flashcard } from '@/features/study/components/Flashcard/Flashcard';
import { FlashcardMetaStrip } from '@/features/study/components/FlashcardMetaStrip';
import { ReviewActionsTrigger } from '@/features/study/components/ReviewActionsTrigger';
import { StudyReviewDock } from '@/features/study/components/StudyReviewDock';
import { StudySessionStatsCard } from '@/features/study/components/StudySessionStatsCard';
import useTabScreenSpacing from '@/hooks/useTabScreenSpacing';
import type { Deck, SessionData } from '@/interfaces';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

export type StudyContentState = 'setup' | 'empty' | 'active';

interface StudyContentProps {
  viewState: StudyContentState;
  decks: Deck[];
  selectedDeckIds: (string | number)[];
  currentCard: StudyCard | null;
  currentCardToken: number;
  totalReviews: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  isReviewProcessing: boolean;
  pendingReviewOutcome?: StudyReviewOutcome | null;
  isDecksLoading: boolean;
  isSessionLoading: boolean;
  decksError: string | null;
  sessionError: string | null;
  sessionData: SessionData[] | null;
  reloadDecks: () => Promise<void>;
  reloadSession: () => Promise<void>;
  onSelectDecks: (deckIds: (string | number)[]) => void;
  onOpenLibrary: () => void;
  onChooseDecks: () => void;
  onForgottenReview: () => void;
  onRememberedReview: () => void;
  onKnownReview: () => void;
  reviewFeedback?: {
    tone: 'warning' | 'error';
    message: string;
  } | null;
}

export const StudyContent: React.FC<StudyContentProps> = ({
  viewState,
  decks,
  selectedDeckIds,
  currentCard,
  currentCardToken,
  totalReviews,
  correctCount,
  incorrectCount,
  accuracy,
  isReviewProcessing,
  pendingReviewOutcome,
  isDecksLoading,
  isSessionLoading,
  decksError,
  sessionError,
  sessionData,
  reloadDecks,
  reloadSession,
  onSelectDecks,
  onOpenLibrary,
  onChooseDecks,
  onForgottenReview,
  onRememberedReview,
  onKnownReview,
  reviewFeedback,
}) => {
  const { height } = useWindowDimensions();
  const {
    bottomSpacing,
    scrollContentContainerStyle,
    scrollIndicatorInsets,
    viewportOffsetStyle,
  } = useTabScreenSpacing();
  const isCompactHeight = height < 760;
  const isVeryCompactHeight = height < 700;
  const showStats = totalReviews > 0;
  const [showReviewActions, setShowReviewActions] = useState(false);

  useEffect(() => {
    setShowReviewActions(false);
  }, [currentCardToken, isReviewProcessing]);

  if (viewState === 'setup') {
    return (
      <ScrollView
        style={[styles.content, viewportOffsetStyle]}
        contentContainerStyle={[
          styles.scrollContent,
          scrollContentContainerStyle,
        ]}
        scrollIndicatorInsets={scrollIndicatorInsets}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.setupSection}>
          <Card padding="lg">
            <Typography variant="heading3" style={styles.setupTitle}>
              Setup Study Session
            </Typography>

            {isDecksLoading ? (
              <LoadingState
                message="Loading your subscribed decks..."
                className="justify-center"
              />
            ) : decksError ? (
              <FeedbackState
                title="Couldn't load subscribed decks"
                description={decksError}
                icon="cloudOff"
                actionLabel="Retry"
                onAction={() => void reloadDecks()}
              />
            ) : decks.length === 0 ? (
              <FeedbackState
                title="No subscribed decks yet"
                description="Subscribe to a deck from the Library tab, then come back here to study."
                icon="library"
                actionLabel="Open Library"
                onAction={onOpenLibrary}
              />
            ) : (
              <View style={styles.dropdownContainer}>
                <Typography variant="caption" style={styles.dropdownLabel}>
                  Choose decks
                </Typography>
                <DecksMultiSelect
                  decks={decks}
                  onSelectDecks={onSelectDecks}
                  selectedDeckIds={selectedDeckIds}
                />
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    );
  }

  if (viewState === 'empty') {
    return (
      <View
        style={[
          styles.content,
          styles.emptyContent,
          viewportOffsetStyle,
          { paddingBottom: bottomSpacing },
        ]}
      >
        {isSessionLoading ? (
          <LoadingState
            message="Loading study session..."
            className="flex-1 justify-center"
          />
        ) : sessionError ? (
          <FeedbackState
            title="Couldn't load this study session"
            description={sessionError}
            icon="cloudOff"
            actionLabel="Retry"
            onAction={() => void reloadSession()}
          />
        ) : sessionData && sessionData.length === 0 ? (
          <FeedbackState
            title="No cards in this session"
            description="Try choosing a different deck or add more cards to the selected deck."
            icon="albums"
            actionLabel="Choose Decks"
            onAction={onChooseDecks}
          />
        ) : (
          <FeedbackState
            title={showStats ? 'Session complete' : 'No cards ready yet'}
            description={
              showStats
                ? 'You reviewed everything currently due in this session.'
                : 'Pick a deck to begin studying.'
            }
            icon={showStats ? 'checkCircle' : 'time'}
            actionLabel="Choose Decks"
            onAction={onChooseDecks}
          />
        )}

        {showStats ? (
          <StudySessionStatsCard
            correctCount={correctCount}
            incorrectCount={incorrectCount}
            accuracy={accuracy}
          />
        ) : null}
      </View>
    );
  }

  if (!currentCard) {
    return null;
  }

  return (
    <ScrollView
      style={[styles.content, viewportOffsetStyle]}
      contentContainerStyle={[
        styles.scrollContent,
        scrollContentContainerStyle,
      ]}
      scrollIndicatorInsets={scrollIndicatorInsets}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.flashcardContainer}>
        <Flashcard
          cardToken={currentCardToken}
          disabled={isReviewProcessing}
          flashcard={currentCard}
          style={[
            styles.flashcard,
            isCompactHeight && styles.flashcardCompact,
            isVeryCompactHeight && styles.flashcardVeryCompact,
          ]}
          onSwipedLeft={onForgottenReview}
          onSwipedRight={onRememberedReview}
          onSwipedUp={onKnownReview}
          testID="study-flashcard"
        />
      </View>

      <View style={styles.flashcardSupportSection}>
        <FlashcardMetaStrip flashcard={currentCard} style={styles.metaStrip} />
        <Typography
          variant="small"
          color="muted"
          style={styles.gestureHintText}
        >
          Swipe left, up, or right to review.
        </Typography>
        <ReviewActionsTrigger
          disabled={isReviewProcessing}
          onPress={() => setShowReviewActions(true)}
        />

        {isReviewProcessing ? (
          <Typography
            variant="small"
            color="muted"
            style={[styles.reviewStatusText, styles.supportingSurface]}
            accessibilityLiveRegion="polite"
          >
            Saving your review...
          </Typography>
        ) : null}
      </View>

      <StudyReviewDock
        visible={showReviewActions}
        onClose={() => setShowReviewActions(false)}
        disabled={isReviewProcessing}
        pendingOutcome={pendingReviewOutcome}
        onForgotten={() => {
          setShowReviewActions(false);
          onForgottenReview();
        }}
        onRemembered={() => {
          setShowReviewActions(false);
          onRememberedReview();
        }}
        onKnown={() => {
          setShowReviewActions(false);
          onKnownReview();
        }}
      />

      {reviewFeedback ? (
        <Card
          variant="outline"
          style={[
            styles.reviewFeedbackCard,
            reviewFeedback.tone === 'error'
              ? styles.reviewFeedbackCardError
              : styles.reviewFeedbackCardWarning,
          ]}
        >
          <Typography
            variant="small"
            color={reviewFeedback.tone === 'error' ? 'error' : 'warning'}
            accessibilityLiveRegion="polite"
          >
            {reviewFeedback.message}
          </Typography>
        </Card>
      ) : null}

      {showStats ? (
        <StudySessionStatsCard
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          accuracy={accuracy}
        />
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyContent: {
    paddingTop: theme.spacing.lg,
  },
  flashcardContainer: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    alignItems: 'center',
  },
  flashcard: {
    width: '100%',
    maxWidth: 400,
  },
  flashcardCompact: {
    height: 320,
    marginVertical: theme.spacing.sm,
  },
  flashcardVeryCompact: {
    height: 288,
    marginVertical: 0,
  },
  flashcardSupportSection: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  supportingSurface: {
    width: '100%',
    maxWidth: 400,
  },
  metaStrip: {
    width: '100%',
    maxWidth: 400,
  },
  gestureHintText: {
    textAlign: 'center',
    maxWidth: 300,
    marginTop: theme.spacing.xs,
  },
  reviewStatusText: {
    textAlign: 'center',
    paddingVertical: theme.spacing.xs,
  },
  reviewFeedbackCard: {
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  reviewFeedbackCardWarning: {
    backgroundColor: theme.colors.warning.light,
    borderColor: theme.colors.warning.light,
  },
  reviewFeedbackCardError: {
    backgroundColor: theme.colors.destructive.light,
    borderColor: theme.colors.destructive.light,
  },
  setupSection: {
    paddingVertical: theme.spacing.xl,
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
    color: theme.colors.mutedForeground,
    fontFamily: theme.fontFamily.medium,
  },
});
