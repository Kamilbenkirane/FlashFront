import type { SessionData } from '@/interfaces';
import {
  cacheKeys,
  readCachedValue,
  writeCachedValue,
} from '@/services/dataCache';
import { normalizeStudyDeckIds } from '@/services/studySessionStorage';
import { createAsyncLock } from '@/utils/asyncLock';

export interface StudyCardReview {
  card_id: string | number;
  success: boolean;
  streak: number;
  last_review_timestamp?: string | Date | null;
}

export interface StudyCardPatch {
  cardId: string | number;
  recto: string;
  verso: string;
  difficulty: number;
}

const withSnapshotLock = createAsyncLock();

const matchesCardId = (left: string | number, right: string | number) =>
  `${left}` === `${right}`;

const toTimestampString = (
  value: string | Date | null | undefined,
): string | null => {
  if (!value) {
    return null;
  }
  return value instanceof Date ? value.toISOString() : value;
};

// The same set of decks always maps to the same snapshot, whatever the order
// they were picked in.
export const buildStudyDeckKey = (deckIds: readonly (string | number)[]) =>
  [...normalizeStudyDeckIds(deckIds)].sort().join(',');

export const applyReviewToSessionData = (
  cards: SessionData[],
  review: StudyCardReview,
): SessionData[] =>
  cards.map((card) =>
    matchesCardId(card.card_id, review.card_id)
      ? {
          ...card,
          success: review.success,
          streak: review.streak,
          lastReviewTimestamp:
            toTimestampString(review.last_review_timestamp) ??
            card.lastReviewTimestamp ??
            null,
        }
      : card,
  );

// Reviews are applied in the order they were made so the latest one wins.
export const applyReviewsToSessionData = (
  cards: SessionData[],
  reviews: readonly StudyCardReview[],
): SessionData[] => reviews.reduce(applyReviewToSessionData, cards);

export const patchSessionDataCard = (
  cards: SessionData[],
  patch: StudyCardPatch,
): SessionData[] =>
  cards.map((card) =>
    matchesCardId(card.card_id, patch.cardId)
      ? {
          ...card,
          recto: patch.recto,
          verso: patch.verso,
          difficulty: patch.difficulty,
        }
      : card,
  );

export const upsertSessionDataCard = (
  cards: SessionData[],
  nextCard: SessionData,
): SessionData[] => {
  const exists = cards.some((card) =>
    matchesCardId(card.card_id, nextCard.card_id),
  );
  if (!exists) {
    return [...cards, nextCard];
  }
  return cards.map((card) =>
    matchesCardId(card.card_id, nextCard.card_id) ? nextCard : card,
  );
};

const buildSnapshotKey = (
  identityId: string,
  deckIds: readonly (string | number)[],
) => cacheKeys.studyCards(identityId, buildStudyDeckKey(deckIds));

export const readStudyCardsSnapshot = (
  identityId: string,
  deckIds: readonly (string | number)[],
) => readCachedValue<SessionData[]>(buildSnapshotKey(identityId, deckIds));

export const writeStudyCardsSnapshot = (
  identityId: string,
  deckIds: readonly (string | number)[],
  cards: SessionData[],
) =>
  withSnapshotLock(() =>
    writeCachedValue(buildSnapshotKey(identityId, deckIds), cards),
  );

const updateStudyCardsSnapshot = (
  identityId: string,
  deckIds: readonly (string | number)[],
  update: (cards: SessionData[]) => SessionData[],
) =>
  withSnapshotLock(async () => {
    const key = buildSnapshotKey(identityId, deckIds);
    const cards = await readCachedValue<SessionData[]>(key);
    if (!cards) {
      return;
    }
    await writeCachedValue(key, update(cards));
  });

// Keeps the stored snapshot in step with what the user just did, so the next
// session starts from up-to-date cards even before the server has heard.
export const applyReviewToStudyCardsSnapshot = (
  identityId: string,
  deckIds: readonly (string | number)[],
  review: StudyCardReview,
) =>
  updateStudyCardsSnapshot(identityId, deckIds, (cards) =>
    applyReviewToSessionData(cards, review),
  );

export const patchStudyCardInSnapshot = (
  identityId: string,
  deckIds: readonly (string | number)[],
  patch: StudyCardPatch,
) =>
  updateStudyCardsSnapshot(identityId, deckIds, (cards) =>
    patchSessionDataCard(cards, patch),
  );

export const upsertStudyCardInSnapshot = (
  identityId: string,
  deckIds: readonly (string | number)[],
  card: SessionData,
) =>
  updateStudyCardsSnapshot(identityId, deckIds, (cards) =>
    upsertSessionDataCard(cards, card),
  );
