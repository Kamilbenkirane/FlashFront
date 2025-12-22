import AsyncStorage from '@react-native-async-storage/async-storage';
import API_URL from '../config';

async function createReview(flashcard, success, user_id) {
  const review = { ...flashcard, success: success, user_id: user_id };
  // convert names to api names :
  review.last_review_timestamp = review.lastReviewTimestamp;
  const url = `${API_URL}/review/create`;
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  };
  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      // Handle non-2xx responses
      throw new Error(
        `Network response was not ok, status: ${response.status}`,
      );
    }
    const reviewResponse = await response.json();
    return reviewResponse;
  } catch (error) {
    await saveReviewLocally(review);
    return { savedLocally: true };
  }
}

async function saveReviewLocally(review) {
  try {
    const localReviews = (await AsyncStorage.getItem('localReviews')) || '[]';
    const reviews = JSON.parse(localReviews);
    reviews.push(review);
    await AsyncStorage.setItem('localReviews', JSON.stringify(reviews));
  } catch (error) {
    // Silent failure - could not save review locally
  }
}

export default createReview;
