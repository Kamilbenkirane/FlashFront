import API_URL from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

async function createSubscription(user, deck) {
  console.log('createSubscription', user, user);
  const subscriptionData = { user_id: user.user_id, deck_id: deck.deck_id };
  // convert names to api names :
  const url = `${API_URL}/subscription/create`;
  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriptionData),
  };

  try {
    const connectionInfo = await NetInfo.fetch();
    const isConnected = connectionInfo.isConnected;
    console.log('isConnected:', isConnected);
    console.log(requestOptions.body);

    if (!isConnected) {
      // save subscription locally if offline
      await saveSubscriptionLocally(subscriptionData);
      return { savedLocally: true };
    }

    const response = await fetch(url, requestOptions);
    if (!response.ok) {
      // Handle non-2xx responses
      throw new Error(
        `Network response was not ok, status: ${response.status}`,
      );
    }
    const subscriptionResponse = await response.json();
    console.log('Subscription created', subscriptionResponse);
    return subscriptionResponse; // Return the response for further processing if needed
  } catch (error) {
    console.error('Failed to create subscription', error);
  }
}

async function saveSubscriptionLocally(subscription) {
  try {
    const localSubscriptions =
      (await AsyncStorage.getItem('localSubscriptions')) || '[]';
    const subscriptions = JSON.parse(localSubscriptions);
    subscriptions.push(subscription);
    await AsyncStorage.setItem(
      'localSubscriptions',
      JSON.stringify(subscriptions),
    );
  } catch (error) {
    console.error('Failed to save subscription locally', error);
  }
}
export default createSubscription;
