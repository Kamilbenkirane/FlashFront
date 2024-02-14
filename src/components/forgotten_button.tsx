import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { forgotButton } from "../styles/Buttons";

// Props could include a function to handle the "forgotten" action
const ForgottenButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={forgotButton.button} onPress={onPress}>
      <Text style={forgotButton.buttonText}>Forgotten</Text>
    </TouchableOpacity>
  );
};

export default ForgottenButton;
