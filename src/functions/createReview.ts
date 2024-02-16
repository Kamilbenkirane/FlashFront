import API_URL from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

async function createReview(flashcard, success, user_id) {
  console.log('createReview', flashcard, success, user_id);
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
    const connectionInfo = await NetInfo.fetch();
    const isConnected = connectionInfo.isConnected;
    console.log('isConnected:', isConnected);

    if (!isConnected) {
      // save review locally if offline
      await saveReviewLocally(review);
      return { savedLocally: true };
    }

    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      // Handle non-2xx responses
      throw new Error(
        `Network response was not ok, status: ${response.status}`,
      );
    }
    const reviewResponse = await response.json();
    console.log('Review created', reviewResponse);
    return reviewResponse; // Return the response for further processing if needed
  } catch (error) {
    console.error('Failed to create review', error);
  }
}

async function saveReviewLocally(review) {
  try {
    const localReviews = (await AsyncStorage.getItem('localReviews')) || '[]';
    const reviews = JSON.parse(localReviews);
    reviews.push(review);
    await AsyncStorage.setItem('localReviews', JSON.stringify(reviews));
  } catch (error) {
    console.error('Failed to save review locally', error);
  }
}

export default createReview;
