// Deck.tsx
import React from 'react';
import { TouchableOpacity, Text, Alert, View } from 'react-native';
import { libraryScreenStyles } from '../styles/LibraryScreenStyles';
import createSubscription from '../functions/createSubscription';
import { useUser } from '../context/UserContext';
import deleteSubscription from '../functions/deleteSubscription';

const Deck = ({ deck, decks }) => {
  const { user, setUser } = useUser();
  const handleSubscriptionChange = async (subscribe) => {
    const updatedUser = { ...user, iteration: user.iteration + 1 || 0 };
    if (subscribe) {
      console.log('user', updatedUser);
      console.log('Subscribing to deck', deck);
      await createSubscription(updatedUser, deck);
    } else {
      await deleteSubscription(updatedUser, deck);
    }
    setUser(updatedUser); // Ensure setUser updates state in a way that causes re-renders
  };

  const handlePress = () => {
    Alert.alert(
      isSubscribed ? 'Unsubscribe' : 'Subscribe',
      `Do you want to ${isSubscribed ? 'unsubscribe from' : 'subscribe to'} this deck?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => handleSubscriptionChange(!isSubscribed) },
      ],
      { cancelable: false },
    );
  };

  const isSubscribed = decks.some((d) => d.deck_id === deck.deck_id);

  return (
    <TouchableOpacity style={libraryScreenStyles.deck} onPress={handlePress}>
      <Text style={libraryScreenStyles.deckText}>{deck.deck_name}</Text>
      <View style={libraryScreenStyles.tickCrossContainer}>
        {isSubscribed ? (
          <Text style={libraryScreenStyles.tickStyle}>✔️</Text>
        ) : (
          <Text style={libraryScreenStyles.crossStyle}>❌</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Deck;
