import { flushPendingOperations } from '@/services/outbox';
import { useEffect } from 'react';

// useSyncLocalReviews depends each review
const useSyncLocalReviews = (review_count) => {
  useEffect(() => {
    void flushPendingOperations();
  }, [review_count]);
};

export default useSyncLocalReviews;
