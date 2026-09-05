import type { SessionData } from '@/interfaces';
import moment from 'moment';

export type StudyReviewOutcome = 'remembered' | 'forgotten' | 'known';

export interface StudyCard {
  card_id: string | number;
  recto: string;
  verso: string;
  lastReviewTimestamp: string | null;
  streak: number;
  success: boolean | null;
  difficulty: number;
  malus: number;
  popupScore: number;
  probability: number;
  secondsSinceLastReview?: number;
}

export interface StudyReviewDraft {
  card_id: string | number;
  success: boolean;
  streak: number;
  last_review_timestamp: string | null;
}

const hasExplicitTimezone = (value: string) =>
  /(?:[zZ]|[+-]\d{2}:\d{2})$/.test(value);

const normalizeReviewTimestamp = (
  value: SessionData['lastReviewTimestamp'] | string | Date | null | undefined,
): string | null => {
  if (!value) {
    return null;
  }

  const parsedValue = moment(value);
  if (!parsedValue.isValid()) {
    return null;
  }

  if (typeof value === 'string' && !hasExplicitTimezone(value)) {
    return parsedValue
      .clone()
      .add(parsedValue.toDate().getTimezoneOffset(), 'minutes')
      .toISOString();
  }

  return parsedValue.toISOString();
};

const getSecondsSinceLastReview = (
  lastReviewTimestamp: string | null,
  now: moment.Moment = moment(),
): number | undefined => {
  if (!lastReviewTimestamp) {
    return undefined;
  }

  const parsedTimestamp = moment(lastReviewTimestamp);
  if (!parsedTimestamp.isValid()) {
    return undefined;
  }

  return now.diff(parsedTimestamp, 'seconds');
};

const calculatePopupScore = (
  card: Pick<StudyCard, 'lastReviewTimestamp' | 'streak' | 'malus'>,
  now: moment.Moment = moment(),
): number => {
  const secondsSinceLastReview = getSecondsSinceLastReview(
    card.lastReviewTimestamp,
    now,
  );

  if (!card.lastReviewTimestamp) {
    return 2 + card.malus;
  }

  if (card.streak === 0) {
    return 1 + card.malus;
  }

  const a = 17;
  const b = 0.8;
  const tMax = a * Math.exp(b * card.streak);

  if (secondsSinceLastReview !== undefined && secondsSinceLastReview < tMax) {
    return (
      Math.min(10000, Math.exp(0.01 * (secondsSinceLastReview - tMax))) +
      card.malus
    );
  }

  if (secondsSinceLastReview !== undefined) {
    return secondsSinceLastReview / tMax + card.malus;
  }

  return 2 + card.malus;
};

export const rehydrateStudyCard = (
  card: Omit<
    StudyCard,
    'popupScore' | 'probability' | 'secondsSinceLastReview'
  >,
  now: moment.Moment = moment(),
): StudyCard => {
  const secondsSinceLastReview = getSecondsSinceLastReview(
    card.lastReviewTimestamp,
    now,
  );

  return {
    ...card,
    secondsSinceLastReview,
    popupScore: calculatePopupScore(card, now),
    probability: 1,
  };
};

export const createStudyCard = (
  sessionData: SessionData,
  now: moment.Moment = moment(),
): StudyCard =>
  rehydrateStudyCard(
    {
      card_id: sessionData.card_id,
      recto: sessionData.recto,
      verso: sessionData.verso,
      lastReviewTimestamp: normalizeReviewTimestamp(
        sessionData.lastReviewTimestamp ?? null,
      ),
      streak: sessionData.streak ?? 0,
      success: sessionData.success ?? null,
      difficulty: sessionData.difficulty ?? 0,
      malus: 0,
    },
    now,
  );

export const applyReviewToStudyCard = (
  card: StudyCard,
  outcome: StudyReviewOutcome,
  now: moment.Moment = moment(),
): StudyCard => {
  const reviewTimestamp = now.toISOString();
  const isSuccess = outcome !== 'forgotten';
  const nextStreak =
    outcome === 'forgotten'
      ? Math.floor(card.streak * 0.7)
      : outcome === 'known'
        ? card.streak + 6
        : card.streak + 1;

  return rehydrateStudyCard(
    {
      ...card,
      lastReviewTimestamp: reviewTimestamp,
      streak: nextStreak,
      success: isSuccess,
      malus: outcome === 'forgotten' ? card.malus + 1 : 0,
    },
    now,
  );
};

export const toStudyReviewDraft = (card: StudyCard): StudyReviewDraft => ({
  card_id: card.card_id,
  success: card.success ?? false,
  streak: card.streak,
  last_review_timestamp: card.lastReviewTimestamp,
});
