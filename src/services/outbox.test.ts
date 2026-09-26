import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  storage,
  createReviewMock,
  createSubscriptionMock,
  deleteSubscriptionMock,
} = vi.hoisted(() => ({
  storage: new Map<string, string>(),
  createReviewMock: vi.fn(),
  createSubscriptionMock: vi.fn(),
  deleteSubscriptionMock: vi.fn(),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => storage.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      storage.set(key, value);
    },
  },
}));

vi.mock('@/services/backendClient', () => ({
  createCurrentReviewRequest: createReviewMock,
  createCurrentSubscriptionRequest: createSubscriptionMock,
  deleteSubscriptionRequest: deleteSubscriptionMock,
}));

import { ApiError } from '@/services/apiError';
import {
  clearPendingOperations,
  enqueueReviewOperation,
  enqueueSubscriptionCreate,
  enqueueSubscriptionDelete,
  flushPendingOperations,
  getPendingReviewMutations,
} from '@/services/outbox';

const review = (id: string, cardId: number) => ({
  card_id: cardId,
  success: true,
  streak: 1,
  last_review_timestamp: '2026-09-14T08:00:00Z',
  client_event_id: id,
});

const createDeferred = () => {
  let resolve: () => void = () => undefined;
  const promise = new Promise<void>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
};

describe('outbox', () => {
  beforeEach(() => {
    storage.clear();
    createReviewMock.mockReset();
    createSubscriptionMock.mockReset();
    deleteSubscriptionMock.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('delivers queued reviews in order and empties the queue', async () => {
    createReviewMock.mockResolvedValue(null);
    await enqueueReviewOperation(review('r1', 1));
    await enqueueReviewOperation(review('r2', 2));

    await expect(flushPendingOperations()).resolves.toBe(true);

    expect(createReviewMock.mock.calls.map(([item]) => item.card_id)).toEqual([
      1, 2,
    ]);
    expect(await getPendingReviewMutations()).toEqual([]);
  });

  it('keeps everything and stops at a network failure', async () => {
    createReviewMock.mockRejectedValue(new TypeError('Network request failed'));
    await enqueueReviewOperation(review('r1', 1));
    await enqueueReviewOperation(review('r2', 2));

    await expect(flushPendingOperations()).resolves.toBe(false);

    expect(createReviewMock).toHaveBeenCalledTimes(1);
    expect(
      (await getPendingReviewMutations()).map((item) => item.client_event_id),
    ).toEqual(['r1', 'r2']);
  });

  it('drops an item the server rejected for good and keeps going', async () => {
    createReviewMock
      .mockRejectedValueOnce(new ApiError('unknown card', 404))
      .mockResolvedValueOnce(null);
    await enqueueReviewOperation(review('r1', 1));
    await enqueueReviewOperation(review('r2', 2));

    await expect(flushPendingOperations()).resolves.toBe(true);

    expect(createReviewMock).toHaveBeenCalledTimes(2);
    expect(await getPendingReviewMutations()).toEqual([]);
  });

  it('keeps an item behind an expired session for a later retry', async () => {
    createReviewMock.mockRejectedValue(new ApiError('expired', 401));
    await enqueueReviewOperation(review('r1', 1));

    await expect(flushPendingOperations()).resolves.toBe(false);

    expect(await getPendingReviewMutations()).toHaveLength(1);
  });

  it('does not lose an item enqueued while a flush is running', async () => {
    const firstDelivery = createDeferred();
    createReviewMock
      .mockReturnValueOnce(firstDelivery.promise)
      .mockResolvedValue(null);
    await enqueueReviewOperation(review('r1', 1));

    const flush = flushPendingOperations();
    expect(flushPendingOperations()).toBe(flush);
    await enqueueReviewOperation(review('r2', 2));
    firstDelivery.resolve();

    await expect(flush).resolves.toBe(true);
    expect(createReviewMock.mock.calls.map(([item]) => item.card_id)).toEqual([
      1, 2,
    ]);
    expect(await getPendingReviewMutations()).toEqual([]);
  });

  it('collapses a subscription added then removed while offline', async () => {
    await enqueueSubscriptionCreate({ deck_id: 7 });
    await enqueueSubscriptionDelete({ deck_id: 7 });
    await enqueueSubscriptionDelete({ deck_id: 8 });
    deleteSubscriptionMock.mockResolvedValue({ deck_id: 8 });

    await expect(flushPendingOperations()).resolves.toBe(true);

    expect(createSubscriptionMock).not.toHaveBeenCalled();
    expect(deleteSubscriptionMock).toHaveBeenCalledTimes(1);
    expect(deleteSubscriptionMock).toHaveBeenCalledWith({ deck_id: 8 });
  });
});

describe('clearPendingOperations', () => {
  beforeEach(() => {
    storage.clear();
    createReviewMock.mockReset();
  });

  it('drops everything still queued', async () => {
    await enqueueReviewOperation(review('r1', 1));
    await enqueueSubscriptionCreate({ deck_id: 7 });

    await clearPendingOperations();

    expect(await getPendingReviewMutations()).toEqual([]);
    await expect(flushPendingOperations()).resolves.toBe(true);
    expect(createReviewMock).not.toHaveBeenCalled();
  });
});
