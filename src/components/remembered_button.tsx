import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { rememberedButton } from '../styles/Buttons';

// Props could include a function to handle the "remembered" action
const RememberedButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={rememberedButton.button} onPress={onPress}>
      <Text style={rememberedButton.buttonText}>Remembered</Text>
    </TouchableOpacity>
  );
};

export default RememberedButton;
