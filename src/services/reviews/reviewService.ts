import type { StudyReviewDraft } from '@/domain/study/models/Flashcard';
import type { ReviewMutation } from '@/services/backendClient';
import { isDeviceOnline } from '@/services/connectivity';
import {
  enqueueReviewOperation,
  flushPendingOperations,
} from '@/services/outbox';

export interface CreateReviewResult {
  queued: boolean;
  offline: boolean;
}

const createReviewClientEventId = () =>
  `review-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const toReviewMutation = (
  review: StudyReviewDraft & { client_event_id?: string },
): ReviewMutation => ({
  ...review,
  client_event_id: review.client_event_id ?? createReviewClientEventId(),
});

// A review is always written to the local queue first, so the study flow never
// waits on the network. Delivery happens in the background and is retried on
// reconnection or when the app comes back to the foreground.
export const createReview = async (
  reviewDraft:
    | (StudyReviewDraft & { client_event_id?: string })
    | null
    | undefined,
): Promise<CreateReviewResult> => {
  if (!reviewDraft) {
    return { queued: false, offline: false };
  }

  await enqueueReviewOperation(toReviewMutation(reviewDraft));

  const offline = !(await isDeviceOnline());
  if (!offline) {
    void flushPendingOperations().catch(() => false);
  }

  return { queued: true, offline };
};
