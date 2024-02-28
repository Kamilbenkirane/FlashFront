import AsyncStorage from '@react-native-async-storage/async-storage';
import createReview from './createReview';
import API_URL from '../config';

async function syncLocalReviews() {
  try {
    const localReviews = (await AsyncStorage.getItem('localReviews')) || '[]';
    const reviews = JSON.parse(localReviews);
    if (reviews.length > 0) {
      console.log('Syncing local reviews');
      try {
        const url = `${API_URL}/review/ask`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Network response was not ok, status: ${response.status}`,
          );
        }
        for (const review of reviews) {
          console.log(review);
          await createReview(review, review.success, review.user_id);
        }
        // Clear local reviews after syncing
        await AsyncStorage.removeItem('localReviews');
      } catch (error) {
        console.log('Failed to connect to the API, skipping sync');
      }
    }
  } catch (error) {
    console.error('Failed to sync local reviews', error);
  }
}

export default syncLocalReviews;
