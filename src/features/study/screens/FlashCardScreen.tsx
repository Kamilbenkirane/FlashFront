import type { AppTabScreenProps } from '@/app/navigation/types';
import type { StudyReviewOutcome } from '@/domain/study/models/Flashcard';
import {
  QuickSettings,
  type SessionSettings,
} from '@/features/study/components/QuickSettings';
import { StudyChatModal } from '@/features/study/components/StudyChatModal';
import {
  StudyContent,
  type StudyContentState,
} from '@/features/study/components/StudyContent';
import { StudyHeader } from '@/features/study/components/StudyHeader';
import useStudyChat from '@/features/study/hooks/useStudyChat';
import useCachedResource from '@/hooks/useCachedResource';
import useSessionData from '@/hooks/useSessionData';
import useStudySession from '@/hooks/useStudySession';
import useSubscribedDecks from '@/hooks/useSubscribedDecks';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/providers/UserProvider';
import {
  getStudyChatImageModelsRequest,
  getStudyChatModelsRequest,
} from '@/services/backendClient';
import { cacheKeys } from '@/services/dataCache';
import { createReview } from '@/services/reviews/reviewService';
import {
  applyReviewToStudyCardsSnapshot,
  patchStudyCardInSnapshot,
  upsertStudyCardInSnapshot,
} from '@/services/studyCardsCache';
import {
  STUDY_CHAT_BACKEND_KEY_MESSAGE,
  STUDY_CHAT_DEFAULT_IMAGE_MODEL_ID,
  STUDY_CHAT_DEFAULT_MODEL_ID,
  type StudyChatCommittedFlashcard,
  type StudyChatModelsResponse,
} from '@/services/studyChat/types';
import {
  clearLastStudiedDeckIds,
  filterSavedStudyDeckIds,
  getLastStudiedDeckIds,
  normalizeStudyDeckIds,
  saveLastStudiedDeckIds,
  shouldRestoreLastStudiedDeckIds,
} from '@/services/studySessionStorage';
import { theme } from '@/tokens/theme';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EMPTY_STUDY_CHAT_MODELS: StudyChatModelsResponse = {
  models: [],
  defaultModel: '',
};

const areSameDeckIds = (
  left: (string | number)[],
  right: (string | number)[],
) =>
  left.length === right.length &&
  left.every((deckId, index) => `${deckId}` === `${right[index]}`);

const pickAvailableModelId = (
  currentModelId: string,
  { models, defaultModel }: StudyChatModelsResponse,
) =>
  models.some((model) => model.id === currentModelId)
    ? currentModelId
    : defaultModel;

type FlashcardScreenProps = AppTabScreenProps<'Flashcard'>;

const FlashcardScreen = ({ navigation, route }: FlashcardScreenProps) => {
  const { authUser } = useAuth();
  const { user, userLoading, onboardingPreferences } = useUser();
  const sessionGoal = onboardingPreferences?.dailyGoal || 20;
  const [sessionPaused, setSessionPaused] = useState(false);
  const [continuePastGoal, setContinuePastGoal] = useState(false);
  const {
    decks,
    isLoading: isDecksLoading,
    hasLoaded: hasDecksLoaded,
    error: decksError,
    reload: reloadDecks,
  } = useSubscribedDecks();
  const [activeDecksIds, setActiveDecksIds] = useState<(string | number)[]>([]);
  const [
    resolvedInitialDeckSelectionIdentityId,
    setResolvedInitialDeckSelectionIdentityId,
  ] = useState<string | null>(null);
  const hasInteractedWithDeckSelectionRef = useRef(false);
  const identityId = authUser?.id ?? null;
  const {
    sessionData,
    isLoading: isSessionLoading,
    error: sessionError,
    reload: reloadSession,
  } = useSessionData(identityId, activeDecksIds);
  const {
    currentCard,
    currentCardToken,
    stats: sessionStats,
    submitReview,
    patchCard,
    insertCard,
  } = useStudySession(sessionData);
  const [pendingReviewOutcome, setPendingReviewOutcome] =
    useState<StudyReviewOutcome | null>(null);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showStudyChat, setShowStudyChat] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<{
    tone: 'warning' | 'error';
    message: string;
  } | null>(null);
  const {
    data: studyChatModelsData,
    isLoading: isStudyChatModelsLoading,
    error: studyChatModelsError,
  } = useCachedResource<StudyChatModelsResponse>({
    cacheKey: identityId ? cacheKeys.studyChatModels(identityId) : null,
    initialData: EMPTY_STUDY_CHAT_MODELS,
    load: getStudyChatModelsRequest,
    fallbackErrorMessage: 'Could not load study chat models.',
    enabled: Boolean(user),
  });
  const {
    data: studyChatImageModelsData,
    isLoading: isStudyChatImageModelsLoading,
    error: studyChatImageModelsError,
  } = useCachedResource<StudyChatModelsResponse>({
    cacheKey: identityId ? cacheKeys.studyChatImageModels(identityId) : null,
    initialData: EMPTY_STUDY_CHAT_MODELS,
    load: getStudyChatImageModelsRequest,
    fallbackErrorMessage: 'Could not load study chat image models.',
    enabled: Boolean(user),
  });
  const studyChatModels = studyChatModelsData.models;
  const studyChatImageModels = studyChatImageModelsData.models;
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    studyChatModelId: STUDY_CHAT_DEFAULT_MODEL_ID,
    studyChatImageModelId: STUDY_CHAT_DEFAULT_IMAGE_MODEL_ID,
  });

  const routeParams = route.params;
  const selectedDeckId = routeParams?.selectedDeckId;
  const selectedDeckName = routeParams?.selectedDeckName;
  const autoStart = routeParams?.autoStart;
  const hasResolvedInitialDeckSelection =
    identityId !== null &&
    resolvedInitialDeckSelectionIdentityId === identityId;
  const availableDeckIds = useMemo(
    () => decks.map((deck) => deck.deck_id),
    [decks],
  );
  const activeDeckNames = useMemo(() => {
    const deckNameById = new Map(
      decks.map((deck) => [`${deck.deck_id}`, deck.deck_name]),
    );

    return activeDecksIds
      .map((deckId) => deckNameById.get(`${deckId}`))
      .filter((deckName): deckName is string => Boolean(deckName));
  }, [activeDecksIds, decks]);
  const activeDeckLabel =
    activeDecksIds.length === 1
      ? (activeDeckNames[0] ?? selectedDeckName ?? 'Selected deck')
      : null;
  const headerTitle =
    activeDecksIds.length === 0
      ? 'Your practice'
      : activeDecksIds.length === 1
        ? `${activeDeckLabel}`
        : `${activeDecksIds.length} decks`;

  useEffect(() => {
    setSessionPaused(false);
    setContinuePastGoal(false);
  }, [sessionData]);

  useEffect(() => {
    hasInteractedWithDeckSelectionRef.current = false;
    setResolvedInitialDeckSelectionIdentityId(null);
    setActiveDecksIds([]);
    setSessionPaused(false);
    setContinuePastGoal(false);
  }, [identityId]);

  useEffect(() => {
    if (!identityId || !selectedDeckId || !autoStart) {
      return;
    }

    const nextDeckIds = normalizeStudyDeckIds([selectedDeckId]);
    setSessionPaused(false);
    setContinuePastGoal(true);
    hasInteractedWithDeckSelectionRef.current = false;
    setResolvedInitialDeckSelectionIdentityId(identityId);
    setActiveDecksIds((currentDeckIds) =>
      areSameDeckIds(currentDeckIds, nextDeckIds)
        ? currentDeckIds
        : nextDeckIds,
    );

    navigation.setParams({
      selectedDeckId: undefined,
      selectedDeckName: undefined,
      autoStart: undefined,
    });
  }, [autoStart, identityId, navigation, selectedDeckId]);

  // Restore the last studied decks as soon as a deck list is known, whether
  // it came from the local cache or from the server.
  useEffect(() => {
    if (
      !user ||
      !identityId ||
      hasResolvedInitialDeckSelection ||
      !hasDecksLoaded ||
      isDecksLoading ||
      !shouldRestoreLastStudiedDeckIds({
        routeSelectedDeckId: selectedDeckId,
        autoStart,
      })
    ) {
      return;
    }

    let isCancelled = false;

    void getLastStudiedDeckIds(identityId).then(
      (savedDeckIds) => {
        if (isCancelled) {
          return;
        }

        const nextDeckIds = filterSavedStudyDeckIds(
          savedDeckIds,
          availableDeckIds,
        );

        if (!hasInteractedWithDeckSelectionRef.current) {
          setActiveDecksIds((currentDeckIds) =>
            areSameDeckIds(currentDeckIds, nextDeckIds)
              ? currentDeckIds
              : nextDeckIds,
          );
        }

        setResolvedInitialDeckSelectionIdentityId(identityId);
      },
      () => {
        if (!isCancelled) {
          setResolvedInitialDeckSelectionIdentityId(identityId);
        }
      },
    );

    return () => {
      isCancelled = true;
    };
  }, [
    autoStart,
    availableDeckIds,
    hasDecksLoaded,
    hasResolvedInitialDeckSelection,
    identityId,
    isDecksLoading,
    selectedDeckId,
    user,
  ]);

  useEffect(() => {
    if (!identityId || resolvedInitialDeckSelectionIdentityId !== identityId) {
      return;
    }

    if (activeDecksIds.length === 0) {
      void clearLastStudiedDeckIds(identityId);
      return;
    }

    void saveLastStudiedDeckIds(identityId, activeDecksIds);
  }, [activeDecksIds, identityId, resolvedInitialDeckSelectionIdentityId]);

  useEffect(() => {
    if (studyChatModelsData.models.length === 0) {
      return;
    }

    setSessionSettings((currentSettings) => {
      const nextModelId = pickAvailableModelId(
        currentSettings.studyChatModelId,
        studyChatModelsData,
      );
      return nextModelId === currentSettings.studyChatModelId
        ? currentSettings
        : { ...currentSettings, studyChatModelId: nextModelId };
    });
  }, [studyChatModelsData]);

  useEffect(() => {
    if (studyChatImageModelsData.models.length === 0) {
      return;
    }

    setSessionSettings((currentSettings) => {
      const nextModelId = pickAvailableModelId(
        currentSettings.studyChatImageModelId,
        studyChatImageModelsData,
      );
      return nextModelId === currentSettings.studyChatImageModelId
        ? currentSettings
        : { ...currentSettings, studyChatImageModelId: nextModelId };
    });
  }, [studyChatImageModelsData]);

  useEffect(() => {
    if (!reviewFeedback) {
      return;
    }

    const timeout = setTimeout(() => {
      setReviewFeedback(null);
    }, 4000);

    return () => {
      clearTimeout(timeout);
    };
  }, [reviewFeedback]);

  useEffect(() => {
    if (!currentCard) {
      setShowStudyChat(false);
    }
  }, [currentCard]);

  const handleDeckSelect = useCallback(
    (selectedDeckIds: (string | number)[] = []) => {
      hasInteractedWithDeckSelectionRef.current = true;
      if (identityId) {
        setResolvedInitialDeckSelectionIdentityId(identityId);
      }

      const nextDeckIds = normalizeStudyDeckIds(selectedDeckIds);
      setActiveDecksIds((currentDeckIds) =>
        areSameDeckIds(currentDeckIds, nextDeckIds)
          ? currentDeckIds
          : nextDeckIds,
      );
    },
    [identityId],
  );

  const handleChooseDecks = useCallback(() => {
    hasInteractedWithDeckSelectionRef.current = true;
    if (identityId) {
      setResolvedInitialDeckSelectionIdentityId(identityId);
    }
    setActiveDecksIds([]);
    setSessionPaused(false);
    setContinuePastGoal(false);
  }, [identityId]);

  // The next card is computed locally and the review is queued on the device,
  // so nothing here waits on the network.
  const submitSessionReview = useCallback(
    async (outcome: StudyReviewOutcome) => {
      if (pendingReviewOutcome || !currentCard) {
        return;
      }

      setPendingReviewOutcome(outcome);
      setReviewFeedback(null);

      try {
        const reviewDraft = submitReview(outcome);
        if (reviewDraft && identityId) {
          void applyReviewToStudyCardsSnapshot(
            identityId,
            activeDecksIds,
            reviewDraft,
          );
        }

        const result = await createReview(reviewDraft);
        if (result.queued && result.offline) {
          setReviewFeedback({
            tone: 'warning',
            message:
              "Review saved locally. We'll sync it automatically when you're back online.",
          });
        }
      } catch {
        setReviewFeedback({
          tone: 'error',
          message:
            "We couldn't queue this review for sync right now. Keep studying and try again in a moment.",
        });
      } finally {
        setPendingReviewOutcome(null);
      }
    },
    [
      activeDecksIds,
      currentCard,
      identityId,
      pendingReviewOutcome,
      submitReview,
    ],
  );

  const handleStudyChatCardPatched = useCallback(
    (flashcard: StudyChatCommittedFlashcard) => {
      const patch = {
        cardId: flashcard.cardId,
        recto: flashcard.recto,
        verso: flashcard.verso,
        difficulty: flashcard.difficulty,
      };
      patchCard(patch);
      if (identityId) {
        void patchStudyCardInSnapshot(identityId, activeDecksIds, patch);
      }
    },
    [activeDecksIds, identityId, patchCard],
  );

  const handleStudyChatCardCreated = useCallback(
    (flashcard: StudyChatCommittedFlashcard) => {
      const card = {
        card_id: flashcard.cardId,
        recto: flashcard.recto,
        verso: flashcard.verso,
        difficulty: flashcard.difficulty,
        lastReviewTimestamp: null,
        streak: 0,
        success: null,
      };
      insertCard(card);
      if (identityId) {
        void upsertStudyCardInSnapshot(identityId, activeDecksIds, card);
      }
    },
    [activeDecksIds, identityId, insertCard],
  );

  const studyChat = useStudyChat({
    currentCardId: currentCard?.card_id ?? null,
    deckIds: activeDecksIds,
    modelId: sessionSettings.studyChatModelId,
    imageModelId: sessionSettings.studyChatImageModelId,
    enabled: showStudyChat,
    onCurrentCardPatched: handleStudyChatCardPatched,
    onNewCardCreated: handleStudyChatCardCreated,
  });

  const handleForgottenReview = useCallback(() => {
    void submitSessionReview('forgotten');
  }, [submitSessionReview]);

  const handleRememberedReview = useCallback(() => {
    void submitSessionReview('remembered');
  }, [submitSessionReview]);

  const handleKnownReview = useCallback(() => {
    void submitSessionReview('known');
  }, [submitSessionReview]);

  const totalReviews =
    sessionStats.correct + sessionStats.incorrect + sessionStats.known;
  const accuracy =
    totalReviews > 0
      ? (sessionStats.correct + sessionStats.known) / totalReviews
      : 0;
  const isProcessing = pendingReviewOutcome !== null;
  const showSummary =
    activeDecksIds.length > 0 &&
    !isProcessing &&
    (sessionPaused || (totalReviews >= sessionGoal && !continuePastGoal));
  const hasStudyChatModel =
    studyChatModels.length > 0 && sessionSettings.studyChatModelId.length > 0;
  const isStudyChatAvailable = currentCard !== null;
  const studyChatUnavailableMessage = isStudyChatModelsLoading
    ? 'Loading study chat models...'
    : (studyChatModelsError ?? STUDY_CHAT_BACKEND_KEY_MESSAGE);
  const studyChatDeckLabel =
    activeDecksIds.length === 1
      ? (activeDeckLabel ?? 'Selected deck')
      : activeDecksIds.length > 1
        ? `${activeDecksIds.length} decks in session`
        : 'Study session';
  // A deck list that failed to load with nothing cached must surface its
  // error instead of waiting forever for a selection to restore.
  const isResolvingInitialDeckSelection =
    userLoading ||
    (Boolean(user) && !hasResolvedInitialDeckSelection && !decksError);

  let studyContentState: StudyContentState = 'active';
  if (activeDecksIds.length === 0) {
    studyContentState = 'setup';
  } else if (!currentCard) {
    studyContentState = 'empty';
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <StudyHeader
        title={headerTitle}
        completedCards={totalReviews}
        totalCards={sessionGoal}
        isActive={activeDecksIds.length > 0 && !showSummary}
        onFinish={
          currentCard && !showSummary && !isProcessing
            ? () => setSessionPaused(true)
            : undefined
        }
        onOpenChat={
          isStudyChatAvailable && !showSummary
            ? () => setShowStudyChat(true)
            : undefined
        }
        onOpenSettings={
          activeDecksIds.length > 0 && !showSummary
            ? () => setShowQuickSettings(true)
            : undefined
        }
      />

      <StudyContent
        viewState={studyContentState}
        sessionGoal={sessionGoal}
        showSummary={showSummary}
        onContinue={() => {
          setSessionPaused(false);
          setContinuePastGoal(true);
        }}
        onViewProgress={() => navigation.navigate('Profile')}
        decks={decks}
        selectedDeckIds={activeDecksIds}
        currentCard={currentCard}
        currentCardToken={currentCardToken}
        totalReviews={totalReviews}
        correctCount={sessionStats.correct + sessionStats.known}
        incorrectCount={sessionStats.incorrect}
        accuracy={accuracy}
        isReviewProcessing={isProcessing}
        pendingReviewOutcome={pendingReviewOutcome}
        isDecksLoading={isDecksLoading || isResolvingInitialDeckSelection}
        isSessionLoading={isSessionLoading}
        decksError={decksError}
        sessionError={sessionError}
        sessionData={sessionData}
        reloadDecks={reloadDecks}
        reloadSession={reloadSession}
        onSelectDecks={handleDeckSelect}
        onOpenLibrary={() => navigation.navigate('Library')}
        onChooseDecks={handleChooseDecks}
        onForgottenReview={handleForgottenReview}
        onRememberedReview={handleRememberedReview}
        onKnownReview={handleKnownReview}
        reviewFeedback={reviewFeedback}
      />

      <QuickSettings
        visible={showQuickSettings}
        onClose={() => setShowQuickSettings(false)}
        sessionSettings={sessionSettings}
        onSettingsChange={setSessionSettings}
        decks={decks}
        selectedDeckIds={activeDecksIds}
        onSelectDecks={handleDeckSelect}
        studyChatModels={studyChatModels}
        isStudyChatModelsLoading={isStudyChatModelsLoading}
        studyChatModelsError={studyChatModelsError}
        studyChatImageModels={studyChatImageModels}
        isStudyChatImageModelsLoading={isStudyChatImageModelsLoading}
        studyChatImageModelsError={studyChatImageModelsError}
        testID="quick-settings"
      />

      <StudyChatModal
        visible={showStudyChat}
        onClose={() => setShowStudyChat(false)}
        deckLabel={studyChatDeckLabel}
        cardQuestion={currentCard?.recto}
        isComposerAvailable={hasStudyChatModel}
        unavailableMessage={studyChatUnavailableMessage}
        messages={studyChat.messages}
        isLoadingHistory={studyChat.isLoadingHistory}
        draft={studyChat.draft}
        onChangeDraft={studyChat.setDraft}
        onSend={() => {
          void studyChat.sendMessage();
        }}
        getFlashcardProposalActionState={
          studyChat.getFlashcardProposalActionState
        }
        getNewFlashcardProposalActionState={
          studyChat.getNewFlashcardProposalActionState
        }
        onToggleFlashcardProposalEditing={
          studyChat.toggleFlashcardProposalEditing
        }
        onToggleNewFlashcardProposalEditing={
          studyChat.toggleNewFlashcardProposalEditing
        }
        onChangeFlashcardProposalDraft={studyChat.updateFlashcardProposalDraft}
        onChangeNewFlashcardProposalDraft={
          studyChat.updateNewFlashcardProposalDraft
        }
        onValidateFlashcardProposal={studyChat.validateFlashcardProposal}
        onValidateNewFlashcardProposal={studyChat.validateNewFlashcardProposal}
        isStreaming={studyChat.isStreaming}
        error={studyChat.error}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default FlashcardScreen;
