import { describe, expect, it, vi } from 'vitest';
import { createStudyCard } from './Flashcard';
import {
  type StudySessionState,
  insertStudySessionCard,
  patchStudySessionCard,
  submitStudyReview,
} from './Session';

const buildSessionState = ({
  activeCards,
  pile = [],
  currentCardIndex = 0,
  currentCardToken = 1,
}: {
  activeCards: ReturnType<typeof createStudyCard>[];
  pile?: ReturnType<typeof createStudyCard>[];
  currentCardIndex?: number;
  currentCardToken?: number;
}): StudySessionState => ({
  pile,
  activeCards,
  currentCard: activeCards[currentCardIndex] ?? null,
  currentCardToken,
});

describe('study session transitions', () => {
  it('applies the review before selecting the next card', () => {
    const now = new Date('2026-04-02T10:00:00Z');
    const currentCard = createStudyCard(
      {
        card_id: 1,
        recto: 'Question A',
        verso: 'Answer A',
        difficulty: 0,
        lastReviewTimestamp: null,
        streak: 0,
        success: null,
      },
      now,
    );
    const pileCard = createStudyCard(
      {
        card_id: 2,
        recto: 'Question B',
        verso: 'Answer B',
        difficulty: 0,
        lastReviewTimestamp: null,
        streak: 0,
        success: null,
      },
      now,
    );

    const initialSession = buildSessionState({
      activeCards: [currentCard],
      pile: [pileCard],
    });

    const result = submitStudyReview(initialSession, 'remembered', {
      now,
      random: () => 0.99,
    });

    expect(result.reviewDraft).toMatchObject({
      card_id: 1,
      success: true,
      streak: 1,
    });
    expect(result.reviewDraft?.last_review_timestamp).toBeTruthy();
    expect(result.session.activeCards).toHaveLength(2);
    expect(result.session.currentCard?.card_id).toBe(2);
  });

  it('emits a fresh card token when the same card is selected again', () => {
    const now = new Date('2026-04-02T10:05:00Z');
    const currentCard = createStudyCard(
      {
        card_id: 3,
        recto: 'Question C',
        verso: 'Answer C',
        difficulty: 0,
        lastReviewTimestamp: null,
        streak: 0,
        success: null,
      },
      now,
    );

    const initialSession = buildSessionState({
      activeCards: [currentCard],
    });

    const result = submitStudyReview(initialSession, 'forgotten', {
      now,
      random: () => 0,
    });

    expect(result.session.currentCard?.card_id).toBe(3);
    expect(result.session.currentCardToken).toBe(
      initialSession.currentCardToken + 1,
    );
    expect(result.reviewDraft).toMatchObject({
      card_id: 3,
      success: false,
      streak: 0,
    });
  });

  it('keeps a current card after consecutive reviews', () => {
    const initialNow = new Date('2026-04-02T10:10:00Z');
    const nextNow = new Date('2026-04-02T10:11:00Z');
    const currentCard = createStudyCard(
      {
        card_id: 4,
        recto: 'Question D',
        verso: 'Answer D',
        difficulty: 0,
        lastReviewTimestamp: null,
        streak: 0,
        success: null,
      },
      initialNow,
    );

    const initialSession = buildSessionState({
      activeCards: [currentCard],
    });

    const firstTransition = submitStudyReview(initialSession, 'remembered', {
      now: initialNow,
      random: () => 0,
    });
    const secondTransition = submitStudyReview(
      firstTransition.session,
      'forgotten',
      {
        now: nextNow,
        random: () => 0,
      },
    );

    expect(firstTransition.session.currentCard).not.toBeNull();
    expect(secondTransition.session.currentCard).not.toBeNull();
    expect(firstTransition.session.currentCard?.card_id).toBe(4);
    expect(secondTransition.session.currentCard?.card_id).toBe(4);
    expect(firstTransition.session.currentCardToken).toBe(2);
    expect(secondTransition.session.currentCardToken).toBe(3);
  });

  it('patches the current card without resetting the session', () => {
    const now = new Date('2026-04-02T10:20:00Z');
    const currentCard = createStudyCard(
      {
        card_id: 10,
        recto: 'Original front',
        verso: 'Original back',
        difficulty: 0,
        lastReviewTimestamp: null,
        streak: 2,
        success: true,
      },
      now,
    );
    const otherCard = createStudyCard(
      {
        card_id: 11,
        recto: 'Question E',
        verso: 'Answer E',
        difficulty: 0,
        lastReviewTimestamp: null,
        streak: 0,
        success: null,
      },
      now,
    );
    const initialSession = buildSessionState({
      activeCards: [currentCard, otherCard],
      currentCardToken: 4,
    });

    const nextSession = patchStudySessionCard(initialSession, {
      cardId: 10,
      recto: 'Updated front',
      verso: 'Updated back',
      difficulty: 3,
    });

    expect(nextSession.currentCard?.recto).toBe('Updated front');
    expect(nextSession.currentCard?.verso).toBe('Updated back');
    expect(nextSession.currentCard?.difficulty).toBe(3);
    expect(nextSession.activeCards[0]?.recto).toBe('Updated front');
    expect(nextSession.activeCards[1]?.card_id).toBe(11);
    expect(nextSession.currentCardToken).toBe(5);
  });

  it('inserts a created card into the pile without interrupting the current step', () => {
    const now = new Date('2026-04-02T10:25:00Z');
    const currentCard = createStudyCard(
      {
        card_id: 12,
        recto: 'Question F',
        verso: 'Answer F',
        difficulty: 0,
        lastReviewTimestamp: null,
        streak: 0,
        success: null,
      },
      now,
    );
    const initialSession = buildSessionState({
      activeCards: [currentCard],
      currentCardToken: 3,
    });

    const nextSession = insertStudySessionCard(initialSession, {
      card_id: 13,
      recto: 'Inserted front',
      verso: 'Inserted back',
      difficulty: 2,
      lastReviewTimestamp: null,
      streak: 0,
      success: null,
    });

    expect(nextSession.currentCard?.card_id).toBe(12);
    expect(nextSession.currentCardToken).toBe(3);
    expect(nextSession.pile).toHaveLength(1);
    expect(nextSession.pile[0]?.card_id).toBe(13);
    expect(nextSession.pile[0]?.recto).toBe('Inserted front');
  });
});

it('preserves timestamp normalization and elapsed seconds without Moment', () => {
  const now = new Date('2026-04-02T11:00:00Z');
  const cardAt = (lastReviewTimestamp: string | Date | null) =>
    createStudyCard(
      {
        card_id: 1,
        recto: 'Question',
        verso: 'Answer',
        lastReviewTimestamp,
      },
      now,
    );
  try {
    for (const [zone, naive, dateOnly, springGap] of [
      [
        'UTC',
        '2026-04-02T10:00:00.000Z',
        '2026-04-02T00:00:00.000Z',
        '2026-03-29T02:30:00.000Z',
      ],
      [
        'Europe/Paris',
        '2026-04-02T06:00:00.000Z',
        '2026-04-01T20:00:00.000Z',
        '2026-03-28T23:30:00.000Z',
      ],
      [
        'America/New_York',
        '2026-04-02T18:00:00.000Z',
        '2026-04-02T08:00:00.000Z',
        '2026-03-29T10:30:00.000Z',
      ],
      [
        'Asia/Kolkata',
        '2026-04-01T23:00:00.000Z',
        '2026-04-01T13:00:00.000Z',
        '2026-03-28T15:30:00.000Z',
      ],
    ]) {
      vi.stubEnv('TZ', zone);
      expect(cardAt('2026-04-02T10:00:00').lastReviewTimestamp).toBe(naive);
      expect(cardAt('2026-04-02').lastReviewTimestamp).toBe(dateOnly);
      expect(cardAt('2026-03-29T02:30:00').lastReviewTimestamp).toBe(springGap);
      for (const value of [
        '2026-04-02T10:00:00Z',
        '2026-04-02T12:00:00+02:00',
        new Date('2026-04-02T10:00:00Z'),
      ]) {
        expect(cardAt(value)).toMatchObject({
          lastReviewTimestamp: '2026-04-02T10:00:00.000Z',
          secondsSinceLastReview: 3600,
        });
      }
      for (const invalid of [
        null,
        'invalid',
        '2026-02-30T10:00:00Z',
        new Date(Number.NaN),
      ]) {
        expect(cardAt(invalid)).toMatchObject({
          lastReviewTimestamp: null,
          secondsSinceLastReview: undefined,
        });
      }
      expect(cardAt('2026-04-02T11:00:00.500Z').secondsSinceLastReview).toBe(0);
      expect(cardAt('2026-04-02T11:00:01.500Z').secondsSinceLastReview).toBe(
        -1,
      );
    }
  } finally {
    vi.unstubAllEnvs();
  }
});
