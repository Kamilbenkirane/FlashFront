import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { knownButton } from '../styles/Buttons';

// Props could include a function to handle the "remembered" action
const KnownButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={knownButton.button} onPress={onPress}>
      <Text style={knownButton.buttonText}>Known</Text>
    </TouchableOpacity>
  );
};

export default KnownButton;
