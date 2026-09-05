import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { flushPendingOperations } from '../services/outbox';

export const OutboxSync = () => {
  const isSyncing = useRef(false);

  const syncOutbox = useCallback(async () => {
    if (isSyncing.current) {
      return;
    }

    isSyncing.current = true;
    try {
      await flushPendingOperations();
    } finally {
      isSyncing.current = false;
    }
  }, []);

  useEffect(() => {
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

    return () => {
      unsubscribeNetInfo();
      appStateSubscription.remove();
    };
  }, [syncOutbox]);

  return null;
};
