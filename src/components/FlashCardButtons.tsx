import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import {
  forgotButton,
  optionsButton,
  rememberedButton,
} from '../styles/Buttons';

// Props could include a function to handle the "forgotten" action
const ForgottenButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={forgotButton.button} onPress={onPress}>
      <Text style={forgotButton.buttonText}>Forgotten</Text>
    </TouchableOpacity>
  );
};

//export default ForgottenButton;

// Props could include a function to handle the "remembered" action
const RememberedButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={rememberedButton.button} onPress={onPress}>
      <Text style={rememberedButton.buttonText}>Remembered</Text>
    </TouchableOpacity>
  );
};

// export default RememberedButton;
