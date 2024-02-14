import AsyncStorage from "@react-native-async-storage/async-storage";
import createReview from "./createReview";
import NetInfo from "@react-native-community/netinfo";

async function syncLocalReviews() {
  try {
    const localReviews = (await AsyncStorage.getItem("localReviews")) || "[]";
    const reviews = JSON.parse(localReviews);
    if (reviews.length > 0) {
      const connectionInfo = await NetInfo.fetch();
      const isConnected = connectionInfo.isInternetReachable;
      if (isConnected) {
        for (const review of reviews) {
          await createReview(review, review.success, review.user_id);
        }
        // Clear local reviews after syncing
        await AsyncStorage.removeItem("localReviews");
      }
    }
  } catch (error) {
    console.error("Failed to sync local reviews", error);
  }
}

export default syncLocalReviews;
