import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import API_URL from '../config';

async function deleteSubscription(user, deck) {
  const subscriptionData = {
    user_id: user.user_id,
    deck_id: deck.deck_id,
    subscription_id: deck.subscription_id,
  };
  const url = `${API_URL}/subscription/delete`;
  const requestOptions = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriptionData),
  };

  try {
    const connectionInfo = await NetInfo.fetch();
    const isConnected = connectionInfo.isConnected;

    if (!isConnected) {
      // delete subscription locally if offline
      await deleteSubscriptionLocally(subscriptionData);
      return { deletedLocally: true };
    }

    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      // Handle non-2xx responses
      throw new Error(
        `Network response was not ok, status: ${response.status}`,
      );
    }
    const subscriptionResponse = await response.json();
    return subscriptionResponse;
  } catch (error) {
    // Silent failure - subscription deletion failed
  }
}

async function deleteSubscriptionLocally(subscription) {
  try {
    const localSubscriptions =
      (await AsyncStorage.getItem('localSubscriptions')) || '[]';
    const subscriptions = JSON.parse(localSubscriptions);
    const index = subscriptions.findIndex(
      (s) =>
        s.user_id === subscription.user_id &&
        s.deck_id === subscription.deck_id,
    );
    if (index !== -1) {
      subscriptions.splice(index, 1);
      await AsyncStorage.setItem(
        'localSubscriptions',
        JSON.stringify(subscriptions),
      );
    }
  } catch (error) {
    // Silent failure - could not delete subscription locally
  }
}

export default deleteSubscription;
