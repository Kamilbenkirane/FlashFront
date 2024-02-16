// Deck.tsx
import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { libraryScreenStyles } from '../styles/LibraryScreenStyles';
import createSubscription from '../functions/createSubscription';

const Deck = ({ user, deck }) => {
  const handlePress = () => {
    Alert.alert(
      'Subscribe',
      'Do you want to subscribe to this deck?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: () => createSubscription(user, deck),
        },
      ],
      { cancelable: false },
    );
  };

  return (
    <TouchableOpacity style={libraryScreenStyles.deck} onPress={handlePress}>
      <Text style={libraryScreenStyles.deckText}>{deck.deck_name}</Text>
    </TouchableOpacity>
  );
};

export default Deck;
