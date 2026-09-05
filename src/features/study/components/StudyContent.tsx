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
import { PracticeOrbit } from '@/features/study/components/PracticeOrbit';
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
  userName: string;
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
  userName,
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
  const { height, width } = useWindowDimensions();
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
          <Typography variant="small" color="primary" style={styles.eyebrow}>
            A MOMENT WELL SPENT
          </Typography>
          <PracticeOrbit
            value={totalReviews}
            total={sessionGoal}
            label="reviews completed"
            size={208}
          />
          <Typography variant="heading1" style={styles.centered}>
            {totalReviews >= sessionGoal
              ? 'Look how far you came.'
              : 'Every review counts.'}
          </Typography>
          <Typography color="muted" style={styles.centered}>
            You made time for your mind. Let it settle, then come back when
            you’re ready.
          </Typography>
          <View style={{ width: '100%' }}>{stats}</View>
          <Button
            title="Back to my decks"
            onPress={onChooseDecks}
            fullWidth
            size="lg"
          />
          <Button
            title="See my progress"
            onPress={onViewProgress}
            fullWidth
            variant="outline"
          />
          <Button
            title="Keep practicing"
            onPress={onContinue}
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
          <View style={styles.greeting}>
            <Typography color="muted">
              Your space to grow{userName ? `, ${userName.split(' ')[0]}` : ''}.
            </Typography>
            <Typography variant="display" style={styles.headline}>
              Make it stick.
            </Typography>
          </View>
          <View
            style={[styles.setupColumns, width >= 820 && styles.wideColumns]}
          >
            <Card
              padding="lg"
              style={[styles.hero, width >= 820 && { flex: 1 }]}
            >
              <View style={styles.heroTop}>
                <View style={styles.heroCopy}>
                  <Typography
                    variant="small"
                    color="primary"
                    style={styles.eyebrow}
                  >
                    YOUR DAILY PRACTICE
                  </Typography>
                  <Typography variant="heading3" style={{ marginTop: 8 }}>
                    A little focus.{'\n'}A brighter mind.
                  </Typography>
                </View>
                <PracticeOrbit
                  value={sessionGoal}
                  total={0}
                  label="review goal"
                  size={108}
                />
              </View>
              <View style={styles.heroFooter}>
                <AppIcon
                  name="sparkles"
                  size={16}
                  color={theme.colors.primary}
                />
                <Typography variant="caption" color="muted" style={{ flex: 1 }}>
                  One connection at a time.
                </Typography>
              </View>
            </Card>
            <View style={[styles.nextSession, width >= 820 && { flex: 1 }]}>
              <View style={styles.sectionHeader}>
                <Typography variant="heading3">Your next session</Typography>
                <Pressable
                  onPress={onOpenLibrary}
                  accessibilityRole="button"
                  style={styles.textAction}
                >
                  <Typography variant="caption" color="primary">
                    Browse library ↗
                  </Typography>
                </Pressable>
              </View>
              {isDecksLoading ? (
                <LoadingState message="Finding your decks…" />
              ) : decksError ? (
                <FeedbackState
                  title="Your decks couldn’t load"
                  description={decksError}
                  icon="cloudOff"
                  actionLabel="Try again"
                  onAction={() => void reloadDecks()}
                />
              ) : decks.length === 0 ? (
                <FeedbackState
                  title="What sparks your curiosity?"
                  description="Find a deck you love. Your first session starts there."
                  icon="library"
                  actionLabel="Explore the library"
                  onAction={onOpenLibrary}
                />
              ) : (
                <Card padding="lg" style={styles.sessionCard}>
                  <View style={styles.sessionCardTitle}>
                    <View style={styles.deckIcon}>
                      <AppIcon
                        name="layers"
                        color={theme.colors.primary}
                        size={22}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Typography variant="heading3">
                        Choose your focus
                      </Typography>
                      <Typography variant="caption" color="muted">
                        One deck or a mix. You decide.
                      </Typography>
                    </View>
                  </View>
                  <DecksMultiSelect
                    decks={decks}
                    onSelectDecks={setDraftDeckIds}
                    selectedDeckIds={draftSelection}
                  />
                  <View style={styles.sessionDetails}>
                    <Typography variant="caption" color="muted">
                      {sessionGoal} reviews · pause whenever you like
                    </Typography>
                  </View>
                  <Button
                    title="Start my session"
                    onPress={() => onSelectDecks(draftSelection)}
                    disabled={draftSelection.length === 0}
                    fullWidth
                    size="lg"
                    iconPosition="right"
                    icon={
                      <AppIcon
                        name="chevronRight"
                        color={theme.colors.primaryForeground}
                        size={19}
                      />
                    }
                    testID="start-study-session"
                  />
                </Card>
              )}
            </View>
          </View>
          <View style={styles.guide}>
            <Typography variant="small" color="muted" style={styles.eyebrow}>
              THE ART OF REMEMBERING
            </Typography>
            <View style={styles.guideSteps}>
              {[
                {
                  number: '01',
                  title: 'Recall',
                  description: 'Give your mind a moment.',
                },
                {
                  number: '02',
                  title: 'Reveal',
                  description: 'Make the connection.',
                },
                {
                  number: '03',
                  title: 'Reflect',
                  description: 'Let your next review adapt.',
                },
              ].map((step) => (
                <View key={step.number} style={styles.guideStep}>
                  <Typography variant="small" color="primary">
                    {step.number} —
                  </Typography>
                  <Typography style={styles.stepTitle}>{step.title}</Typography>
                  <Typography variant="small" color="muted">
                    {step.description}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
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
              title="Let’s try that again"
              description={sessionError}
              icon="cloudOff"
              actionLabel="Reload session"
              onAction={() => void reloadSession()}
            />
          ) : (
            <FeedbackState
              title={
                sessionData?.length === 0
                  ? 'A little breathing room.'
                  : 'You’re all caught up.'
              }
              description="There are no cards ready in this session. Explore another deck, or come back later."
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
        <View style={styles.cardHeading}>
          <Typography variant="small" color="primary" style={styles.eyebrow}>
            {isRevealed ? 'MAKE THE CONNECTION' : 'ONE THOUGHT AT A TIME'}
          </Typography>
          <Typography variant="small" color="muted">
            {isRevealed ? '02 / Reflect' : '01 / Recall'}
          </Typography>
        </View>
        <Flashcard
          cardToken={currentCardToken}
          revealed={isRevealed}
          disabled={isReviewProcessing}
          flashcard={currentCard}
          onFlip={(revealed) =>
            setRevealedCardToken(revealed ? currentCardToken : null)
          }
          style={{ minHeight: Math.max(250, Math.min(height - 440, 400)) }}
          onSwipedLeft={onForgottenReview}
          onSwipedRight={onRememberedReview}
          testID="study-flashcard"
        />
        <View style={styles.cardSupport}>
          <FlashcardMetaStrip flashcard={currentCard} />
        </View>
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
            iconPosition="right"
            icon={
              <AppIcon
                name="chevronDown"
                size={19}
                color={theme.colors.primaryForeground}
              />
            }
            testID="reveal-answer"
          />
        )}
        <Typography
          variant="small"
          color="muted"
          style={styles.reviewHint}
          accessibilityLiveRegion="polite"
        >
          {isReviewProcessing
            ? 'Saving your review…'
            : isRevealed
              ? 'Forgetting is part of learning. Be honest with yourself.'
              : 'Try to recall before you reveal.'}
        </Typography>
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
        {totalReviews > 0 ? stats : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 12 },
  setup: { width: '100%', maxWidth: 1072, alignSelf: 'center' },
  greeting: { gap: 10, marginTop: 8, marginBottom: 20 },
  headline: { fontSize: 38, lineHeight: 44, letterSpacing: -1.6 },
  eyebrow: {
    letterSpacing: 1.6,
    fontFamily: theme.fontFamily.medium,
    fontSize: 10,
  },
  setupColumns: { gap: 20 },
  wideColumns: { flexDirection: 'row', alignItems: 'flex-start' },
  hero: { borderColor: '#658594', backgroundColor: '#0A2A3B', padding: 18 },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroCopy: { flex: 1 },
  heroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 8,
    paddingTop: 12,
  },
  nextSession: { gap: 12 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  textAction: { minHeight: 44, justifyContent: 'center' },
  sessionCard: { gap: 14 },
  sessionCardTitle: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  deckIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  guide: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 20,
  },
  guideSteps: { flexDirection: 'row', gap: 16 },
  guideStep: { flex: 1, gap: 8 },
  stepTitle: { fontFamily: theme.fontFamily.medium },
  summary: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
    paddingTop: 28,
    gap: 16,
  },
  centered: { textAlign: 'center' },
  studyWidth: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  cardHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 14,
  },
  cardSupport: { paddingTop: 20, paddingBottom: 16 },
  reviewHint: { textAlign: 'center', paddingTop: 14 },
  feedback: { marginTop: 16 },
});
