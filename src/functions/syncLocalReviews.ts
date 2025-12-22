import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config';
import createReview from './createReview';

async function syncLocalReviews() {
  try {
    const localReviews = (await AsyncStorage.getItem('localReviews')) || '[]';
    const reviews = JSON.parse(localReviews);
    if (reviews.length > 0) {
      try {
        const url = `${API_URL}/review/ask`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Network response was not ok, status: ${response.status}`,
          );
        }
        for (const review of reviews) {
          await createReview(review, review.success, review.user_id);
        }
        await AsyncStorage.removeItem('localReviews');
      } catch (error) {
        // Silent failure - API not available, skip sync
      }
    }
  } catch (error) {
    // Silent failure - failed to sync local reviews
  }
}

export default syncLocalReviews;
