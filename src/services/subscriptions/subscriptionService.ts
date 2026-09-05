import {
  type SubscriptionMutation,
  createCurrentSubscriptionRequest,
  deleteSubscriptionRequest,
} from '@/services/backendClient';
import {
  enqueueSubscriptionCreate,
  enqueueSubscriptionDelete,
} from '@/services/outbox';
import { runWithConnectivityFallback } from '@/services/runWithConnectivityFallback';

type CreateSubscriptionResult =
  | Awaited<ReturnType<typeof createCurrentSubscriptionRequest>>
  | { savedLocally: true };

type DeleteSubscriptionResult =
  | Awaited<ReturnType<typeof deleteSubscriptionRequest>>
  | { deletedLocally: true };

export const createDeckSubscription = async (deckId: string | number) => {
  const subscriptionData: SubscriptionMutation = { deck_id: deckId };

  return runWithConnectivityFallback<CreateSubscriptionResult>({
    runOnline: () => createCurrentSubscriptionRequest(subscriptionData),
    runOffline: async () => {
      await enqueueSubscriptionCreate(subscriptionData);
    },
    offlineResult: { savedLocally: true },
  });
};

export const deleteDeckSubscription = async (deckId: string | number) => {
  const subscriptionData: SubscriptionMutation = { deck_id: deckId };

  return runWithConnectivityFallback<DeleteSubscriptionResult>({
    runOnline: () => deleteSubscriptionRequest(subscriptionData),
    runOffline: async () => {
      await enqueueSubscriptionDelete(subscriptionData);
    },
    offlineResult: { deletedLocally: true },
  });
};
