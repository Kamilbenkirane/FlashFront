import { useEffect } from 'react';
import syncLocalReviews from '../functions/syncLocalReviews';
import API_URL from '../config';

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
        console.log('Syncing local reviews');
        syncLocalReviews();
      } catch (error) {
        console.log('Failed to connect to the API, skipping sync');
      }
    };

    syncReviews();
  }, [review_count]);
};

export default useSyncLocalReviews;
