import type { SessionData } from '@/interfaces';
import {
  type StudyCard,
  type StudyReviewDraft,
  type StudyReviewOutcome,
  applyReviewToStudyCard,
  createStudyCard,
  rehydrateStudyCard,
  toStudyReviewDraft,
} from './Flashcard';

export interface StudySessionState {
  pile: StudyCard[];
  activeCards: StudyCard[];
  currentCard: StudyCard | null;
  currentCardToken: number;
}

export interface StudySessionTransitionResult {
  session: StudySessionState;
  reviewDraft: StudyReviewDraft | null;
}

export interface StudySessionCardPatch {
  cardId: string | number;
  recto: string;
  verso: string;
  difficulty: number;
}

const REVIEW_SCORE_THRESHOLD = 30;

const matchesCardId = (
  cardId: string | number,
  targetCardId: string | number,
) => `${cardId}` === `${targetCardId}`;

const partitionCards = (
  cards: StudyCard[],
  predicate: (card: StudyCard) => boolean,
): [StudyCard[], StudyCard[]] =>
  cards.reduce<[StudyCard[], StudyCard[]]>(
    (accumulator, card) => {
      if (predicate(card)) {
        accumulator[0].push(card);
      } else {
        accumulator[1].push(card);
      }
      return accumulator;
    },
    [[], []],
  );

const getTotalScore = (cards: StudyCard[]) =>
  cards.reduce((total, card) => total + card.popupScore, 0);

const validateAllActiveCardsHaveBeenReviewed = (cards: StudyCard[]) =>
  cards.every((card) => card.lastReviewTimestamp !== null);

const syncActiveCardsFromPile = (
  session: StudySessionState,
): Pick<StudySessionState, 'pile' | 'activeCards'> => {
  const [previouslyReviewedCards, remainingPile] = partitionCards(
    session.pile,
    (card) => card.lastReviewTimestamp !== null,
  );

  const activeCards = [...session.activeCards, ...previouslyReviewedCards];
  let nextPile = [...remainingPile];
  let nextActiveCards = [...activeCards];
  let totalScore = getTotalScore(nextActiveCards);

  if (validateAllActiveCardsHaveBeenReviewed(nextActiveCards)) {
    while (totalScore < REVIEW_SCORE_THRESHOLD && nextPile.length > 0) {
      const [newCard, ...remainingCards] = nextPile;
      if (!newCard) {
        break;
      }

      nextActiveCards = [...nextActiveCards, newCard];
      nextPile = remainingCards;
      totalScore = getTotalScore(nextActiveCards);
    }
  }

  return {
    pile: nextPile,
    activeCards: nextActiveCards,
  };
};

const computeCardProbabilities = (
  cards: StudyCard[],
  now: Date = new Date(),
): StudyCard[] => {
  const rescoredCards = cards.map((card) => rehydrateStudyCard(card, now));
  const totalScore = getTotalScore(rescoredCards);

  if (rescoredCards.length === 0) {
    return rescoredCards;
  }

  if (totalScore <= 0) {
    const fallbackProbability = 1 / rescoredCards.length;
    return rescoredCards.map((card) => ({
      ...card,
      probability: fallbackProbability,
    }));
  }

  return rescoredCards.map((card) => ({
    ...card,
    probability: card.popupScore / totalScore,
  }));
};

const chooseCardBasedOnProbability = (
  cards: StudyCard[],
  random: () => number = Math.random,
): StudyCard | null => {
  if (cards.length === 0) {
    return null;
  }

  const randomValue = random();
  let cumulativeProbability = 0;

  for (const card of cards) {
    cumulativeProbability += card.probability;
    if (randomValue <= cumulativeProbability) {
      return card;
    }
  }

  return cards[cards.length - 1] ?? null;
};

const selectNextCard = (
  session: StudySessionState,
  random: () => number = Math.random,
  now: Date = new Date(),
): StudySessionState => {
  const { pile, activeCards } = syncActiveCardsFromPile(session);
  const nextActiveCards = computeCardProbabilities(activeCards, now);

  return {
    pile,
    activeCards: nextActiveCards,
    currentCard: chooseCardBasedOnProbability(nextActiveCards, random),
    currentCardToken: session.currentCardToken + 1,
  };
};

export const createStudySessionState = (
  sessionData: SessionData[],
  options?: {
    random?: () => number;
    now?: Date;
  },
): StudySessionState =>
  selectNextCard(
    {
      pile: sessionData.map((data) => createStudyCard(data, options?.now)),
      activeCards: [],
      currentCard: null,
      currentCardToken: 0,
    },
    options?.random,
    options?.now,
  );

export const submitStudyReview = (
  session: StudySessionState,
  outcome: StudyReviewOutcome,
  options?: {
    random?: () => number;
    now?: Date;
  },
): StudySessionTransitionResult => {
  if (!session.currentCard) {
    return {
      session,
      reviewDraft: null,
    };
  }

  const reviewedCard = applyReviewToStudyCard(
    session.currentCard,
    outcome,
    options?.now,
  );

  const nextActiveCards = session.activeCards.map((card) =>
    `${card.card_id}` === `${reviewedCard.card_id}` ? reviewedCard : card,
  );

  return {
    session: selectNextCard(
      {
        ...session,
        activeCards: nextActiveCards,
        currentCard: reviewedCard,
      },
      options?.random,
      options?.now,
    ),
    reviewDraft: toStudyReviewDraft(reviewedCard),
  };
};

export const patchStudySessionCard = (
  session: StudySessionState,
  patch: StudySessionCardPatch,
  options?: {
    now?: Date;
  },
): StudySessionState => {
  const patchCard = (card: StudyCard): StudyCard =>
    rehydrateStudyCard(
      {
        ...card,
        recto: patch.recto,
        verso: patch.verso,
        difficulty: patch.difficulty,
      },
      options?.now,
    );

  const nextPile = session.pile.map((card) =>
    matchesCardId(card.card_id, patch.cardId) ? patchCard(card) : card,
  );
  const nextActiveCards = session.activeCards.map((card) =>
    matchesCardId(card.card_id, patch.cardId) ? patchCard(card) : card,
  );
  const isCurrentCardPatched =
    session.currentCard !== null &&
    matchesCardId(session.currentCard.card_id, patch.cardId);

  return {
    ...session,
    pile: nextPile,
    activeCards: nextActiveCards,
    currentCard: isCurrentCardPatched
      ? patchCard(session.currentCard!)
      : session.currentCard,
    currentCardToken: isCurrentCardPatched
      ? session.currentCardToken + 1
      : session.currentCardToken,
  };
};

export const insertStudySessionCard = (
  session: StudySessionState,
  sessionData: SessionData,
  options?: {
    now?: Date;
  },
): StudySessionState => ({
  ...session,
  pile: [...session.pile, createStudyCard(sessionData, options?.now)],
});
