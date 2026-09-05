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
import useSessionData from '@/hooks/useSessionData';
import useStudySession from '@/hooks/useStudySession';
import useSubscribedDecks from '@/hooks/useSubscribedDecks';
import useSyncLocalReviews from '@/hooks/useSyncLocalReviews';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/providers/UserProvider';
import {
  getStudyChatImageModelsRequest,
  getStudyChatModelsRequest,
} from '@/services/backendClient';
import { createReview } from '@/services/reviews/reviewService';
import {
  STUDY_CHAT_BACKEND_KEY_MESSAGE,
  STUDY_CHAT_DEFAULT_IMAGE_MODEL_ID,
  STUDY_CHAT_DEFAULT_MODEL_ID,
  type StudyChatCommittedFlashcard,
  type StudyChatModelOption,
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

const areSameDeckIds = (
  left: (string | number)[],
  right: (string | number)[],
) =>
  left.length === right.length &&
  left.every((deckId, index) => `${deckId}` === `${right[index]}`);

type FlashcardScreenProps = AppTabScreenProps<'Flashcard'>;

const FlashcardScreen = ({ navigation, route }: FlashcardScreenProps) => {
  const { authUser } = useAuth();
  const { user, userLoading } = useUser();
  const {
    decks,
    isLoading: isDecksLoading,
    error: decksError,
    reload: reloadDecks,
  } = useSubscribedDecks();
  const [activeDecksIds, setActiveDecksIds] = useState<(string | number)[]>([]);
  const [
    resolvedInitialDeckSelectionIdentityId,
    setResolvedInitialDeckSelectionIdentityId,
  ] = useState<string | null>(null);
  const hasInteractedWithDeckSelectionRef = useRef(false);
  const hasObservedSubscribedDeckLoadRef = useRef(false);
  const {
    sessionData,
    isLoading: isSessionLoading,
    error: sessionError,
    reload: reloadSession,
  } = useSessionData(activeDecksIds);
  const {
    currentCard,
    currentCardToken,
    progress,
    reviewCount,
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
  const [studyChatModels, setStudyChatModels] = useState<
    StudyChatModelOption[]
  >([]);
  const [isStudyChatModelsLoading, setIsStudyChatModelsLoading] =
    useState(false);
  const [studyChatModelsError, setStudyChatModelsError] = useState<
    string | null
  >(null);
  const [studyChatImageModels, setStudyChatImageModels] = useState<
    StudyChatModelOption[]
  >([]);
  const [isStudyChatImageModelsLoading, setIsStudyChatImageModelsLoading] =
    useState(false);
  const [studyChatImageModelsError, setStudyChatImageModelsError] = useState<
    string | null
  >(null);
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    studyChatModelId: STUDY_CHAT_DEFAULT_MODEL_ID,
    studyChatImageModelId: STUDY_CHAT_DEFAULT_IMAGE_MODEL_ID,
  });

  const routeParams = route.params;
  const selectedDeckId = routeParams?.selectedDeckId;
  const selectedDeckName = routeParams?.selectedDeckName;
  const autoStart = routeParams?.autoStart;
  const identityId = authUser?.id ?? null;
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
      ? 'Study Session'
      : activeDecksIds.length === 1
        ? `Studying: ${activeDeckLabel}`
        : `Studying: ${activeDecksIds.length} decks`;

  useSyncLocalReviews(reviewCount);

  useEffect(() => {
    hasInteractedWithDeckSelectionRef.current = false;
    hasObservedSubscribedDeckLoadRef.current = false;
    setResolvedInitialDeckSelectionIdentityId(null);
    setActiveDecksIds([]);
  }, [identityId]);

  useEffect(() => {
    if (user && isDecksLoading) {
      hasObservedSubscribedDeckLoadRef.current = true;
    }
  }, [isDecksLoading, user]);

  useEffect(() => {
    if (!identityId || !selectedDeckId || !autoStart) {
      return;
    }

    const nextDeckIds = normalizeStudyDeckIds([selectedDeckId]);
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

  useEffect(() => {
    if (
      !user ||
      !identityId ||
      hasResolvedInitialDeckSelection ||
      isDecksLoading ||
      !hasObservedSubscribedDeckLoadRef.current ||
      Boolean(decksError) ||
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
    decksError,
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
    if (!user) {
      setStudyChatModels([]);
      setStudyChatModelsError(null);
      setIsStudyChatModelsLoading(false);
      return;
    }

    let isCancelled = false;

    setIsStudyChatModelsLoading(true);
    setStudyChatModelsError(null);

    void getStudyChatModelsRequest()
      .then(({ models, defaultModel }) => {
        if (isCancelled) {
          return;
        }

        setStudyChatModels(models);
        setSessionSettings((currentSettings) => {
          const currentModelStillAvailable = models.some(
            (model) => model.id === currentSettings.studyChatModelId,
          );
          const nextModelId = currentModelStillAvailable
            ? currentSettings.studyChatModelId
            : defaultModel;

          return nextModelId === currentSettings.studyChatModelId
            ? currentSettings
            : { ...currentSettings, studyChatModelId: nextModelId };
        });
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        setStudyChatModels([]);
        setStudyChatModelsError(
          error instanceof Error
            ? error.message
            : 'Could not load study chat models.',
        );
        setSessionSettings((currentSettings) =>
          currentSettings.studyChatModelId === ''
            ? currentSettings
            : { ...currentSettings, studyChatModelId: '' },
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setIsStudyChatModelsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      setStudyChatImageModels([]);
      setStudyChatImageModelsError(null);
      setIsStudyChatImageModelsLoading(false);
      return;
    }

    let isCancelled = false;

    setIsStudyChatImageModelsLoading(true);
    setStudyChatImageModelsError(null);

    void getStudyChatImageModelsRequest()
      .then(({ models, defaultModel }) => {
        if (isCancelled) {
          return;
        }

        setStudyChatImageModels(models);
        setSessionSettings((currentSettings) => {
          const currentModelStillAvailable = models.some(
            (model) => model.id === currentSettings.studyChatImageModelId,
          );
          const nextModelId = currentModelStillAvailable
            ? currentSettings.studyChatImageModelId
            : defaultModel;

          return nextModelId === currentSettings.studyChatImageModelId
            ? currentSettings
            : { ...currentSettings, studyChatImageModelId: nextModelId };
        });
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        setStudyChatImageModels([]);
        setStudyChatImageModelsError(
          error instanceof Error
            ? error.message
            : 'Could not load study chat image models.',
        );
        setSessionSettings((currentSettings) =>
          currentSettings.studyChatImageModelId === ''
            ? currentSettings
            : { ...currentSettings, studyChatImageModelId: '' },
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setIsStudyChatImageModelsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [user]);

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
  }, [identityId]);

  const submitSessionReview = useCallback(
    async (outcome: StudyReviewOutcome) => {
      if (pendingReviewOutcome || !currentCard) {
        return;
      }

      setPendingReviewOutcome(outcome);
      setReviewFeedback(null);

      try {
        const reviewDraft = submitReview(outcome);
        const result = await createReview(reviewDraft);
        const savedLocally =
          typeof result === 'object' &&
          result !== null &&
          'savedLocally' in result &&
          result.savedLocally === true;

        if (savedLocally) {
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
    [currentCard, pendingReviewOutcome, submitReview],
  );

  const handleStudyChatCardPatched = useCallback(
    (flashcard: StudyChatCommittedFlashcard) => {
      patchCard({
        cardId: flashcard.cardId,
        recto: flashcard.recto,
        verso: flashcard.verso,
        difficulty: flashcard.difficulty,
      });
    },
    [patchCard],
  );

  const handleStudyChatCardCreated = useCallback(
    (flashcard: StudyChatCommittedFlashcard) => {
      insertCard({
        card_id: flashcard.cardId,
        recto: flashcard.recto,
        verso: flashcard.verso,
        difficulty: flashcard.difficulty,
        lastReviewTimestamp: null,
        streak: 0,
        success: null,
      });
    },
    [insertCard],
  );

  const studyChat = useStudyChat({
    currentCardId: currentCard?.card_id ?? null,
    deckIds: activeDecksIds,
    modelId: sessionSettings.studyChatModelId,
    imageModelId: sessionSettings.studyChatImageModelId,
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
  const isResolvingInitialDeckSelection =
    userLoading || (Boolean(user) && !hasResolvedInitialDeckSelection);

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
        completedCards={progress.completedCards}
        totalCards={progress.totalCards}
        onOpenChat={
          isStudyChatAvailable ? () => setShowStudyChat(true) : undefined
        }
        onOpenSettings={
          activeDecksIds.length > 0
            ? () => setShowQuickSettings(true)
            : undefined
        }
      />

      <StudyContent
        viewState={studyContentState}
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
