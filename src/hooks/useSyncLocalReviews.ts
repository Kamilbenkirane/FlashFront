import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import syncLocalReviews from '../functions/syncLocalReviews';

// useSyncLocalReviews depends each review
const useSyncLocalReviews = (review_count) => {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        console.log('Syncing local reviews');
        syncLocalReviews();
      }
    });

    // Clean up
    return () => unsubscribe();
  }, [review_count]);
};

export default useSyncLocalReviews;
