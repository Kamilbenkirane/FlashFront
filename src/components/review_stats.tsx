import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function ReviewStats({ session }) {
  return (
    <View>
      <Text>Total Score: {session.totalScore}</Text>
      <Text>Flashcards in session: {session.flashcards.length}</Text>
      <Text>Cards in pile: {session.pile.length}</Text>
    </View>
  );
}
