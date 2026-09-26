import { createAsyncLock } from '@/utils/asyncLock';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type ApiError, isDefinitiveRequestError } from './apiError';
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

// Every read-modify-write of the stored queue goes through this lock so an
// item enqueued while a flush is running can never be dropped by a stale write.
const withOutboxLock = createAsyncLock();

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

const appendOutboxItem = (item: OutboxItem) =>
  withOutboxLock(async () => {
    const items = await readOutbox();
    const nextItems = item.type.startsWith('subscription.')
      ? compactSubscriptionQueue(items, item)
      : [...items, item];
    await writeOutbox(nextItems);
    return item;
  });

const removeOutboxItem = (itemId: string) =>
  withOutboxLock(async () => {
    const items = await readOutbox();
    await writeOutbox(items.filter((item) => item.id !== itemId));
  });

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

// Drops everything still queued, e.g. when the account signs out so nothing
// is ever delivered under another account's token.
export const clearPendingOperations = () =>
  withOutboxLock(() => writeOutbox([]));

// Reviews still waiting to reach the server, oldest first.
export const getPendingReviewMutations = async (): Promise<ReviewMutation[]> =>
  (await withOutboxLock(readOutbox))
    .filter((item) => item.type === 'review.create')
    .map((item) => item.payload as ReviewMutation);

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

// An item the server refused outright would block everything queued behind it
// forever, so it is dropped. Anything transient keeps its place for a retry.
const shouldDropRejectedItem = (error: unknown) =>
  isDefinitiveRequestError(error) && (error as ApiError).status !== 401;

const deliverPendingItems = async (): Promise<boolean> => {
  const items = await withOutboxLock(readOutbox);

  for (const item of items) {
    try {
      await deliverOutboxItem(item);
    } catch (error) {
      if (!shouldDropRejectedItem(error)) {
        return false;
      }
      console.warn(`Dropping outbox item ${item.id} rejected by the server`);
    }

    await removeOutboxItem(item.id);
  }

  return true;
};

let inFlightFlush: Promise<boolean> | null = null;
let flushRequestedWhileInFlight = false;

// Only one flush runs at a time. A request made while one is running makes
// it go around once more, so items added mid-flight are picked up too.
export const flushPendingOperations = (): Promise<boolean> => {
  if (inFlightFlush) {
    flushRequestedWhileInFlight = true;
    return inFlightFlush;
  }

  inFlightFlush = (async () => {
    let delivered = true;
    do {
      flushRequestedWhileInFlight = false;
      delivered = await deliverPendingItems();
    } while (delivered && flushRequestedWhileInFlight);
    return delivered;
  })().finally(() => {
    inFlightFlush = null;
  });

  return inFlightFlush;
};
