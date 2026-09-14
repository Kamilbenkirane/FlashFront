import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { flushPendingOperations } from '../services/outbox';

// A delivery that fails (still offline, server unreachable) is retried on a
// timer, so a queued review never depends on a connectivity event alone.
const RETRY_DELAY_MS = 30_000;

// flushPendingOperations runs one flush at a time, so overlapping triggers
// (mount, reconnection, foreground, retry) are safe.
export const OutboxSync = () => {
  // Nothing can be delivered without a session, and flushing before the
  // stored session is restored would only trigger a needless token refresh.
  const hasSession = useAuth().session !== null;
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasSession) {
      return;
    }

    let isMounted = true;

    const clearRetry = () => {
      if (retryTimeoutRef.current !== null) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };

    const syncOutbox = () => {
      clearRetry();
      void flushPendingOperations()
        .catch(() => false)
        .then((delivered) => {
          if (!isMounted || delivered || retryTimeoutRef.current !== null) {
            return;
          }
          retryTimeoutRef.current = setTimeout(() => {
            retryTimeoutRef.current = null;
            syncOutbox();
          }, RETRY_DELAY_MS);
        });
    };

    syncOutbox();

    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        syncOutbox();
      }
    });

    const appStateSubscription = AppState.addEventListener(
      'change',
      (status) => {
        if (status === 'active') {
          syncOutbox();
        }
      },
    );

    // On the web NetInfo follows the Network Information API, which does not
    // always report a connection coming back; the window event does.
    const usesWindowEvents =
      Platform.OS === 'web' && typeof window !== 'undefined';
    if (usesWindowEvents) {
      window.addEventListener('online', syncOutbox);
    }

    return () => {
      isMounted = false;
      clearRetry();
      unsubscribeNetInfo();
      appStateSubscription.remove();
      if (usesWindowEvents) {
        window.removeEventListener('online', syncOutbox);
      }
    };
  }, [hasSession]);

  return null;
};
