import { useEffect } from 'react';
import syncLocalReviews from '../functions/syncLocalReviews';

// Flush reviews queued while offline, re-running whenever a review lands.
// syncLocalReviews already checks the API is reachable before it posts anything.
const useSyncLocalReviews = (review_count: number) => {
  useEffect(() => {
    syncLocalReviews();
  }, [review_count]);
};

export default useSyncLocalReviews;
