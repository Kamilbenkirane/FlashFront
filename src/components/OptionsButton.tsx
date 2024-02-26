import React from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import { optionsButton } from '../styles/Buttons';
import API_URL from '../config';

const OptionsButton = ({ onPress, flashcard }) => {
  // Define handlePress inside the component to access flashcard
  const handlePress = () => {
    Alert.alert(
      'Options',
      'What would you like to do?',
      [
        { text: 'Edit', onPress: () => handleEdit() },
        { text: 'Delete', onPress: () => console.log('Delete pressed') },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel pressed'),
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  const handleEdit = () => {
    Alert.alert(
      'Edit',
      'Would you like to modify recto or verso?',
      [
        {
          text: 'Recto',
          onPress: () => {
            Alert.prompt(
              'Edit Recto',
              'Enter the new text for Recto',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel pressed'),
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: async (text) => {
                    console.log('OK Pressed, Recto text: ' + text);
                    // Modify the flashcard.recto value
                    flashcard.recto = text;
                    // Call the API to update the flashcard in the database
                    const url = `${API_URL}/flashcard/modify`;
                    const requestOptions = {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(flashcard),
                    };
                    console.log('Request to modify:', requestOptions);
                    const response = await fetch(url, requestOptions);
                    const data = await response.json();
                    console.log('Response from modify:', data);
                  },
                },
              ],
              'plain-text',
              flashcard.recto, // This is the initial value for the text input
            );
          },
        },
        {
          text: 'Verso',
          onPress: () => {
            Alert.prompt(
              'Edit Verso',
              'Enter the new text for Verso',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel pressed'),
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: async (text) => {
                    console.log('OK Pressed, Verso text: ' + text);
                    // Modify the flashcard.recto value
                    flashcard.verso = text;
                    // Call the API to update the flashcard in the database
                    const url = `${API_URL}/flashcard/modify`;
                    const requestOptions = {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(flashcard),
                    };
                    console.log('Request to modify:', requestOptions);
                    const response = await fetch(url, requestOptions);
                    const data = await response.json();
                    console.log('Response from modify:', data);
                  },
                },
              ],
              'plain-text',
              flashcard.verso, // This is the initial value for the text input
            );
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel pressed'),
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <TouchableOpacity style={optionsButton.button} onPress={handlePress}>
      <Text style={optionsButton.buttonText}>...</Text>
    </TouchableOpacity>
  );
};

export default OptionsButton;
