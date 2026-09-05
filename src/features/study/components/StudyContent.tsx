import { ShuffleMark } from '@/components/ui/Brand/ShuffleMark';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FeedbackState } from '@/components/ui/FeedbackState/FeedbackState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import type {
  StudyCard,
  StudyReviewOutcome,
} from '@/domain/study/models/Flashcard';
import DecksMultiSelect from '@/features/library/components/DecksMultiSelect';
import { Flashcard } from '@/features/study/components/Flashcard/Flashcard';
import { FlashcardMetaStrip } from '@/features/study/components/FlashcardMetaStrip';
import { StudyReviewDock } from '@/features/study/components/StudyReviewDock';
import { StudySessionStatsCard } from '@/features/study/components/StudySessionStatsCard';
import useTabScreenSpacing from '@/hooks/useTabScreenSpacing';
import type { Deck, SessionData } from '@/interfaces';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

export type StudyContentState = 'setup' | 'empty' | 'active';

interface StudyContentProps {
  viewState: StudyContentState;
  sessionGoal: number;
  showSummary: boolean;
  onContinue: () => void;
  onViewProgress: () => void;
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
  sessionGoal,
  showSummary,
  onContinue,
  onViewProgress,
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
  const { bottomSpacing, scrollIndicatorInsets } = useTabScreenSpacing();
  const [draftDeckIds, setDraftDeckIds] = useState<(string | number)[] | null>(
    null,
  );
  const [revealedCardToken, setRevealedCardToken] = useState<number | null>(
    null,
  );
  useEffect(() => {
    setRevealedCardToken(null);
  }, [sessionData]);
  const isRevealed = revealedCardToken === currentCardToken;
  const draftSelection =
    draftDeckIds ??
    (selectedDeckIds.length
      ? selectedDeckIds
      : decks[0]
        ? [decks[0].deck_id]
        : []);
  const contentStyle = [
    styles.scrollContent,
    { paddingBottom: bottomSpacing + 24 },
  ];
  const stats = (
    <StudySessionStatsCard
      correctCount={correctCount}
      incorrectCount={incorrectCount}
      accuracy={accuracy}
    />
  );

  if (showSummary) {
    return (
      <ScrollView
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summary}>
          <View style={styles.completeIcon}>
            <AppIcon name="check" size={28} color={theme.colors.primary} />
          </View>
          <Typography
            variant="heading1"
            style={styles.centered}
            accessibilityRole="header"
          >
            Session complete
          </Typography>
          <Typography color="muted">{totalReviews} reviews</Typography>
          <View style={{ width: '100%' }}>{stats}</View>
          <Button title="Done" onPress={onChooseDecks} fullWidth size="lg" />
          <Button
            title="Continue studying"
            onPress={onContinue}
            fullWidth
            variant="outline"
          />
          <Button
            title="View progress"
            onPress={onViewProgress}
            fullWidth
            variant="ghost"
          />
          {reviewFeedback ? (
            <Typography
              color={reviewFeedback.tone === 'error' ? 'error' : 'warning'}
              variant="caption"
              accessibilityLiveRegion="polite"
            >
              {reviewFeedback.message}
            </Typography>
          ) : null}
        </View>
      </ScrollView>
    );
  }

  if (viewState === 'setup') {
    return (
      <ScrollView
        contentContainerStyle={contentStyle}
        scrollIndicatorInsets={scrollIndicatorInsets}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.setup}>
          <Card padding="lg" style={styles.sessionPanel}>
            <View style={styles.goalRow}>
              <View style={{ gap: 6 }}>
                <Typography variant="caption" color="muted">
                  Session target
                </Typography>
                <View style={styles.goalValue}>
                  <Typography style={styles.goalNumber}>
                    {sessionGoal}
                  </Typography>
                  <Typography color="muted">reviews</Typography>
                </View>
              </View>
              <ShuffleMark size={48} />
            </View>
            <View style={styles.sectionHeader}>
              <Typography variant="heading3">Decks</Typography>
              <Pressable
                onPress={onOpenLibrary}
                accessibilityRole="button"
                style={styles.textAction}
              >
                <Typography variant="caption" color="primary">
                  Browse library
                </Typography>
              </Pressable>
            </View>
            {isDecksLoading ? (
              <LoadingState message="Loading decks…" />
            ) : decksError ? (
              <FeedbackState
                title="Couldn’t load decks"
                description={decksError}
                icon="cloudOff"
                actionLabel="Try again"
                onAction={() => void reloadDecks()}
              />
            ) : decks.length === 0 ? (
              <FeedbackState
                title="No decks yet"
                description="Add a deck from the library to start studying."
                icon="library"
                actionLabel="Browse library"
                onAction={onOpenLibrary}
              />
            ) : (
              <View style={styles.sessionForm}>
                <DecksMultiSelect
                  decks={decks}
                  onSelectDecks={setDraftDeckIds}
                  selectedDeckIds={draftSelection}
                />
                <Button
                  title="Start session"
                  onPress={() => onSelectDecks(draftSelection)}
                  disabled={draftSelection.length === 0}
                  fullWidth
                  size="lg"
                  testID="start-study-session"
                />
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    );
  }

  if (viewState === 'empty' || !currentCard) {
    return (
      <ScrollView contentContainerStyle={contentStyle}>
        <View style={styles.studyWidth}>
          {isSessionLoading ? (
            <LoadingState message="Preparing your session…" />
          ) : sessionError ? (
            <FeedbackState
              title="Couldn’t load this session"
              description={sessionError}
              icon="cloudOff"
              actionLabel="Reload session"
              onAction={() => void reloadSession()}
            />
          ) : (
            <FeedbackState
              title="No cards to review"
              description="Choose another deck or come back later."
              icon="checkCircle"
              actionLabel="Choose another deck"
              onAction={onChooseDecks}
            />
          )}
          {totalReviews > 0 ? stats : null}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={contentStyle}
      scrollIndicatorInsets={scrollIndicatorInsets}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.studyWidth}>
        <Flashcard
          cardToken={currentCardToken}
          revealed={isRevealed}
          disabled={isReviewProcessing}
          flashcard={currentCard}
          onFlip={(revealed) =>
            setRevealedCardToken(revealed ? currentCardToken : null)
          }
          style={{ minHeight: Math.max(280, Math.min(height - 400, 420)) }}
          onSwipedLeft={onForgottenReview}
          onSwipedRight={onRememberedReview}
          testID="study-flashcard"
        />
        <FlashcardMetaStrip flashcard={currentCard} />
        <View style={styles.reviewActions}>
          {isRevealed ? (
            <StudyReviewDock
              disabled={isReviewProcessing}
              pendingOutcome={pendingReviewOutcome}
              onForgotten={onForgottenReview}
              onRemembered={onRememberedReview}
              onKnown={onKnownReview}
            />
          ) : (
            <Button
              title="Reveal answer"
              size="lg"
              fullWidth
              disabled={isReviewProcessing}
              onPress={() => setRevealedCardToken(currentCardToken)}
              testID="reveal-answer"
            />
          )}
        </View>
        {isReviewProcessing ? (
          <Typography
            variant="small"
            color="muted"
            style={styles.reviewHint}
            accessibilityLiveRegion="polite"
          >
            Saving review…
          </Typography>
        ) : null}
        {reviewFeedback ? (
          <Card style={styles.feedback}>
            <Typography
              variant="caption"
              color={reviewFeedback.tone === 'error' ? 'error' : 'warning'}
              accessibilityLiveRegion="polite"
            >
              {reviewFeedback.message}
            </Typography>
          </Card>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16 },
  setup: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingTop: 12,
    gap: 16,
  },
  sessionPanel: { gap: 18, borderRadius: 24 },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 22,
  },
  goalValue: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  goalNumber: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 40,
    lineHeight: 46,
    color: theme.colors.foreground,
  },
  completeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textAction: { minHeight: 44, justifyContent: 'center' },
  sessionForm: { gap: 20 },
  summary: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
    paddingTop: 48,
    gap: 16,
  },
  centered: { textAlign: 'center' },
  studyWidth: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  reviewActions: { paddingTop: 24 },
  reviewHint: { textAlign: 'center', paddingTop: 14 },
  feedback: { marginTop: 16 },
});
