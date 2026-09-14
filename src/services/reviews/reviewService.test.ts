import { beforeEach, describe, expect, it, vi } from 'vitest';

const { enqueueMock, flushMock, isOnlineMock } = vi.hoisted(() => ({
  enqueueMock: vi.fn(),
  flushMock: vi.fn(),
  isOnlineMock: vi.fn(),
}));

vi.mock('@/services/outbox', () => ({
  enqueueReviewOperation: enqueueMock,
  flushPendingOperations: flushMock,
}));

vi.mock('@/services/connectivity', () => ({
  isDeviceOnline: isOnlineMock,
}));

import { createReview } from '@/services/reviews/reviewService';

const draft = {
  card_id: 12,
  success: true,
  streak: 2,
  last_review_timestamp: '2026-09-14T08:00:00Z',
};

describe('createReview', () => {
  beforeEach(() => {
    enqueueMock.mockReset();
    flushMock.mockReset();
    isOnlineMock.mockReset();
    enqueueMock.mockResolvedValue(undefined);
    flushMock.mockResolvedValue(true);
  });

  it('queues the review locally and syncs in the background when online', async () => {
    isOnlineMock.mockResolvedValue(true);

    await expect(createReview(draft)).resolves.toEqual({
      queued: true,
      offline: false,
    });

    expect(enqueueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        card_id: 12,
        client_event_id: expect.stringMatching(/^review-/),
      }),
    );
    expect(flushMock).toHaveBeenCalledTimes(1);
  });

  it('queues the review without trying the network when offline', async () => {
    isOnlineMock.mockResolvedValue(false);

    await expect(createReview(draft)).resolves.toEqual({
      queued: true,
      offline: true,
    });

    expect(enqueueMock).toHaveBeenCalledTimes(1);
    expect(flushMock).not.toHaveBeenCalled();
  });

  it('keeps a client event id already assigned to the draft', async () => {
    isOnlineMock.mockResolvedValue(true);

    await createReview({ ...draft, client_event_id: 'review-fixed' });

    expect(enqueueMock).toHaveBeenCalledWith(
      expect.objectContaining({ client_event_id: 'review-fixed' }),
    );
  });

  it('does nothing without a draft', async () => {
    await expect(createReview(null)).resolves.toEqual({
      queued: false,
      offline: false,
    });
    expect(enqueueMock).not.toHaveBeenCalled();
  });
});
