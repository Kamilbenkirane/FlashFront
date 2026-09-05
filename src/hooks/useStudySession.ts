import type {
  StudyReviewDraft,
  StudyReviewOutcome,
} from '@/domain/study/models/Flashcard';
import {
  type StudySessionState,
  createStudySessionState,
  insertStudySessionCard,
  patchStudySessionCard,
  submitStudyReview,
} from '@/domain/study/models/Session';
import { useCallback, useEffect, useRef, useState } from 'react';
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

  const hydrateSession = useCallback(
    (nextSessionData: SessionData[] | null | undefined) => {
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

  return {
    currentCard: sessionState?.currentCard ?? null,
    currentCardToken: sessionState?.currentCardToken ?? 0,
    stats,
    reviewCount,
    submitReview,
    patchCard,
    insertCard,
  };
};

export default useStudySession;
