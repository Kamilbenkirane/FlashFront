import type { StudyReviewDraft } from '@/domain/study/models/Flashcard';
import type { ReviewMutation } from '@/services/backendClient';
import { createCurrentReviewRequest } from '@/services/backendClient';
import { enqueueReviewOperation } from '@/services/outbox';
import { runWithConnectivityFallback } from '@/services/runWithConnectivityFallback';

const createReviewClientEventId = () =>
  `review-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const toReviewMutation = (
  review: StudyReviewDraft & { client_event_id?: string },
): ReviewMutation => ({
  ...review,
  client_event_id: review.client_event_id ?? createReviewClientEventId(),
});

export const createReview = async (
  reviewDraft:
    | (StudyReviewDraft & { client_event_id?: string })
    | null
    | undefined,
) => {
  if (!reviewDraft) {
    return { savedLocally: false };
  }

  const review = toReviewMutation(reviewDraft);

  return runWithConnectivityFallback({
    runOnline: () => createCurrentReviewRequest(review),
    runOffline: async () => {
      await enqueueReviewOperation(review);
    },
    offlineResult: { savedLocally: true },
  });
};
