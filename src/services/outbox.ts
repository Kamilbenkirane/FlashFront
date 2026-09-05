import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type ReviewMutation,
  type SubscriptionMutation,
  createCurrentReviewRequest,
  createCurrentSubscriptionRequest,
  deleteSubscriptionRequest,
} from './backendClient';

type OutboxOperationType =
  | 'review.create'
  | 'subscription.create'
  | 'subscription.delete';

interface OutboxItem {
  id: string;
  type: OutboxOperationType;
  createdAt: string;
  payload: ReviewMutation | SubscriptionMutation;
}

const OUTBOX_KEY = 'flashfront.outbox.v1';

const createOutboxId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const readOutbox = async (): Promise<OutboxItem[]> => {
  const storedOutbox = await AsyncStorage.getItem(OUTBOX_KEY);
  return storedOutbox ? (JSON.parse(storedOutbox) as OutboxItem[]) : [];
};

const writeOutbox = async (items: OutboxItem[]) => {
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
};

const isSameSubscription = (
  left: SubscriptionMutation,
  right: SubscriptionMutation,
) => `${left.deck_id}` === `${right.deck_id}`;

const compactSubscriptionQueue = (
  items: OutboxItem[],
  nextItem: OutboxItem,
): OutboxItem[] => {
  const nextPayload = nextItem.payload as SubscriptionMutation;
  const remainingItems = items.filter((item) => {
    if (!item.type.startsWith('subscription.')) {
      return true;
    }

    return !isSameSubscription(
      item.payload as SubscriptionMutation,
      nextPayload,
    );
  });

  const previousItem = items.find((item) => {
    if (!item.type.startsWith('subscription.')) {
      return false;
    }

    return isSameSubscription(
      item.payload as SubscriptionMutation,
      nextPayload,
    );
  });

  if (!previousItem) {
    return [...remainingItems, nextItem];
  }

  if (
    previousItem.type === 'subscription.create' &&
    nextItem.type === 'subscription.delete'
  ) {
    return remainingItems;
  }

  return [...remainingItems, nextItem];
};

const appendOutboxItem = async (item: OutboxItem) => {
  const items = await readOutbox();
  const nextItems = item.type.startsWith('subscription.')
    ? compactSubscriptionQueue(items, item)
    : [...items, item];
  await writeOutbox(nextItems);
  return item;
};

export const enqueueReviewOperation = async (review: ReviewMutation) => {
  return appendOutboxItem({
    id: review.client_event_id,
    type: 'review.create',
    createdAt: new Date().toISOString(),
    payload: review,
  });
};

export const enqueueSubscriptionCreate = async (
  subscription: SubscriptionMutation,
) =>
  appendOutboxItem({
    id: createOutboxId('subscription-create'),
    type: 'subscription.create',
    createdAt: new Date().toISOString(),
    payload: subscription,
  });

export const enqueueSubscriptionDelete = async (
  subscription: SubscriptionMutation,
) =>
  appendOutboxItem({
    id: createOutboxId('subscription-delete'),
    type: 'subscription.delete',
    createdAt: new Date().toISOString(),
    payload: subscription,
  });

const deliverOutboxItem = async (item: OutboxItem) => {
  if (item.type === 'review.create') {
    await createCurrentReviewRequest(item.payload as ReviewMutation);
    return true;
  }

  if (item.type === 'subscription.create') {
    await createCurrentSubscriptionRequest(
      item.payload as SubscriptionMutation,
    );
    return true;
  }

  if (item.type === 'subscription.delete') {
    await deleteSubscriptionRequest(item.payload as SubscriptionMutation);
    return true;
  }

  return false;
};

export const flushPendingOperations = async () => {
  const items = await readOutbox();
  if (items.length === 0) {
    return true;
  }

  const remainingItems = [...items];
  for (const item of items) {
    try {
      await deliverOutboxItem(item);
      remainingItems.shift();
      await writeOutbox(remainingItems);
    } catch (error) {
      return false;
    }
  }

  return true;
};
