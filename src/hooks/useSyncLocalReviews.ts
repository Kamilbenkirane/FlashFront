import { useEffect } from 'react';
import API_URL from '../config';
import syncLocalReviews from '../functions/syncLocalReviews';

// useSyncLocalReviews depends each review
const useSyncLocalReviews = (review_count) => {
  useEffect(() => {
    const syncReviews = async () => {
      try {
        const url = `${API_URL}/review/ask`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Network response was not ok, status: ${response.status}`,
          );
        }
        syncLocalReviews();
      } catch (error) {
        // Silent failure - API not available, skip sync
      }
    };

    syncReviews();
  }, [review_count]);
};

export default useSyncLocalReviews;
