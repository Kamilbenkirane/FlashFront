import { beforeEach, describe, expect, it, vi } from 'vitest';

const { store } = vi.hoisted(() => ({ store: new Map<string, string>() }));

vi.mock('@/services/storage/StorageAdapter', () => ({
  StorageAdapter: class {
    async getString(key: string) {
      return store.get(key) ?? null;
    }
    async setString(key: string, value: string) {
      store.set(key, value);
    }
    async removeString(key: string) {
      store.delete(key);
    }
    async clearAll() {
      store.clear();
    }
  },
}));

import type { SessionData } from '@/interfaces';
import {
  applyReviewToSessionData,
  applyReviewToStudyCardsSnapshot,
  applyReviewsToSessionData,
  buildStudyDeckKey,
  patchSessionDataCard,
  patchStudyCardInSnapshot,
  readStudyCardsSnapshot,
  upsertSessionDataCard,
  upsertStudyCardInSnapshot,
  writeStudyCardsSnapshot,
} from '@/services/studyCardsCache';

const cards: SessionData[] = [
  {
    card_id: 1,
    recto: 'Q1',
    verso: 'A1',
    difficulty: 0,
    lastReviewTimestamp: null,
    streak: 0,
    success: null,
  },
  {
    card_id: 2,
    recto: 'Q2',
    verso: 'A2',
    difficulty: 1,
    lastReviewTimestamp: '2026-09-01T10:00:00Z',
    streak: 3,
    success: true,
  },
];

describe('buildStudyDeckKey', () => {
  it('ignores order, duplicates and id types', () => {
    expect(buildStudyDeckKey([2, '1', 2])).toBe(buildStudyDeckKey(['1', 2]));
    expect(buildStudyDeckKey([])).toBe('');
  });
});

describe('session data updates', () => {
  it('applies a review to the matching card only', () => {
    const next = applyReviewToSessionData(cards, {
      card_id: '1',
      success: true,
      streak: 1,
      last_review_timestamp: '2026-09-14T08:00:00Z',
    });

    expect(next[0]).toMatchObject({
      card_id: 1,
      success: true,
      streak: 1,
      lastReviewTimestamp: '2026-09-14T08:00:00Z',
    });
    expect(next[1]).toBe(cards[1]);
  });

  it('keeps the previous timestamp when the review has none and applies reviews in order', () => {
    const next = applyReviewsToSessionData(cards, [
      { card_id: 2, success: false, streak: 2, last_review_timestamp: null },
      {
        card_id: 2,
        success: true,
        streak: 3,
        last_review_timestamp: new Date('2026-09-14T09:00:00Z'),
      },
    ]);

    expect(next[1]).toMatchObject({
      success: true,
      streak: 3,
      lastReviewTimestamp: '2026-09-14T09:00:00.000Z',
    });
  });

  it('patches card content and upserts new cards', () => {
    const patched = patchSessionDataCard(cards, {
      cardId: 2,
      recto: 'Q2 revised',
      verso: 'A2 revised',
      difficulty: 4,
    });
    expect(patched[1]).toMatchObject({
      recto: 'Q2 revised',
      verso: 'A2 revised',
      difficulty: 4,
      streak: 3,
    });

    const inserted = upsertSessionDataCard(cards, {
      card_id: 3,
      recto: 'Q3',
      verso: 'A3',
    });
    expect(inserted).toHaveLength(3);

    const replaced = upsertSessionDataCard(inserted, {
      card_id: '3',
      recto: 'Q3 bis',
      verso: 'A3',
    });
    expect(replaced).toHaveLength(3);
    expect(replaced[2]?.recto).toBe('Q3 bis');
  });
});

describe('study cards snapshot', () => {
  beforeEach(() => {
    store.clear();
  });

  it('does nothing when no snapshot exists for the deck set', async () => {
    await applyReviewToStudyCardsSnapshot('user-1', [1], {
      card_id: 1,
      success: true,
      streak: 1,
    });

    expect(await readStudyCardsSnapshot('user-1', [1])).toBeNull();
  });

  it('keeps the stored snapshot in step with reviews, patches and new cards', async () => {
    await writeStudyCardsSnapshot('user-1', [2, 1], cards);

    await applyReviewToStudyCardsSnapshot('user-1', [1, 2], {
      card_id: 1,
      success: true,
      streak: 1,
      last_review_timestamp: '2026-09-14T08:00:00Z',
    });
    await patchStudyCardInSnapshot('user-1', [1, 2], {
      cardId: 2,
      recto: 'Q2 revised',
      verso: 'A2',
      difficulty: 2,
    });
    await upsertStudyCardInSnapshot('user-1', [1, 2], {
      card_id: 3,
      recto: 'Q3',
      verso: 'A3',
      lastReviewTimestamp: null,
      streak: 0,
      success: null,
    });

    const snapshot = await readStudyCardsSnapshot('user-1', [1, 2]);
    expect(snapshot).toHaveLength(3);
    expect(snapshot?.[0]).toMatchObject({ streak: 1, success: true });
    expect(snapshot?.[1]).toMatchObject({ recto: 'Q2 revised', difficulty: 2 });
    expect(snapshot?.[2]).toMatchObject({ card_id: 3 });
    expect(await readStudyCardsSnapshot('user-2', [1, 2])).toBeNull();
  });

  it('serializes concurrent updates so none is lost', async () => {
    await writeStudyCardsSnapshot('user-1', [1], cards);

    await Promise.all([
      applyReviewToStudyCardsSnapshot('user-1', [1], {
        card_id: 1,
        success: true,
        streak: 1,
      }),
      applyReviewToStudyCardsSnapshot('user-1', [1], {
        card_id: 2,
        success: false,
        streak: 0,
      }),
    ]);

    const snapshot = await readStudyCardsSnapshot('user-1', [1]);
    expect(snapshot?.[0]).toMatchObject({ streak: 1, success: true });
    expect(snapshot?.[1]).toMatchObject({ streak: 0, success: false });
  });
});
