import type {
  StudyReviewDraft,
  StudyReviewOutcome,
} from '@/domain/study/models/Flashcard';
import {
  type StudySessionProgress,
  type StudySessionState,
  createStudySessionState,
  getStudySessionProgress,
  insertStudySessionCard,
  patchStudySessionCard,
  submitStudyReview,
} from '@/domain/study/models/Session';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SessionData } from '../interfaces';

interface StudySessionStats {
  correct: number;
  incorrect: number;
  known: number;
}

const EMPTY_STATS: StudySessionStats = {
  correct: 0,
  incorrect: 0,
  known: 0,
};

const cloneEmptyStats = (): StudySessionStats => ({ ...EMPTY_STATS });

const applyOutcomeToStats = (
  stats: StudySessionStats,
  outcome: StudyReviewOutcome,
): StudySessionStats => {
  if (outcome === 'known') {
    return {
      ...stats,
      known: stats.known + 1,
    };
  }

  return {
    ...stats,
    correct: outcome === 'remembered' ? stats.correct + 1 : stats.correct,
    incorrect: outcome === 'forgotten' ? stats.incorrect + 1 : stats.incorrect,
  };
};

const useStudySession = (sessionData: SessionData[] | null | undefined) => {
  const [sessionState, setSessionState] = useState<StudySessionState | null>(
    null,
  );
  const [stats, setStats] = useState<StudySessionStats>(cloneEmptyStats);
  const [reviewCount, setReviewCount] = useState(0);
  const sessionRef = useRef<StudySessionState | null>(null);
  const sessionDataRef = useRef<SessionData[] | null | undefined>(sessionData);

  const hydrateSession = useCallback(
    (nextSessionData: SessionData[] | null | undefined) => {
      sessionDataRef.current = nextSessionData;

      if (!nextSessionData || nextSessionData.length === 0) {
        sessionRef.current = null;
        setSessionState(null);
        setStats(cloneEmptyStats());
        setReviewCount(0);
        return;
      }

      const nextSession = createStudySessionState(nextSessionData);
      sessionRef.current = nextSession;
      setSessionState(nextSession);
      setStats(cloneEmptyStats());
      setReviewCount(0);
    },
    [],
  );

  useEffect(() => {
    hydrateSession(sessionData);
  }, [sessionData, hydrateSession]);

  const submitReview = useCallback(
    (outcome: StudyReviewOutcome): StudyReviewDraft | null => {
      const currentSession = sessionRef.current;
      if (!currentSession) {
        return null;
      }

      const result = submitStudyReview(currentSession, outcome);
      sessionRef.current = result.session;
      setSessionState(result.session);
      setStats((previous) => applyOutcomeToStats(previous, outcome));
      setReviewCount((previous) => previous + 1);
      return result.reviewDraft;
    },
    [],
  );

  const resetSession = useCallback(() => {
    hydrateSession(sessionDataRef.current);
  }, [hydrateSession]);

  const patchCard = useCallback(
    (patch: {
      cardId: string | number;
      recto: string;
      verso: string;
      difficulty: number;
    }) => {
      const currentSession = sessionRef.current;
      if (!currentSession) {
        return;
      }

      const nextSession = patchStudySessionCard(currentSession, patch);
      sessionRef.current = nextSession;
      setSessionState(nextSession);
    },
    [],
  );

  const insertCard = useCallback((card: SessionData) => {
    const currentSession = sessionRef.current;
    if (!currentSession) {
      return;
    }

    const nextSession = insertStudySessionCard(currentSession, card);
    sessionRef.current = nextSession;
    setSessionState(nextSession);
  }, []);

  const progress: StudySessionProgress = useMemo(
    () => getStudySessionProgress(sessionState),
    [sessionState],
  );

  return {
    currentCard: sessionState?.currentCard ?? null,
    currentCardToken: sessionState?.currentCardToken ?? 0,
    stats,
    reviewCount,
    progress,
    submitReview,
    resetSession,
    patchCard,
    insertCard,
  };
};

export default useStudySession;
