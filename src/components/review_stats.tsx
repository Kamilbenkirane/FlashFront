import React, {useEffect, useState} from "react";
import { Text, TouchableOpacity, View } from "react-native";


export default function ReviewStats({ flashcard }) {
    return (
        <View>
            <Text>Total Score: {flashcard.total_score}</Text>
            <Text>Active Cards: {flashcard.active_cards}</Text>
            <Text>Cards in pile: {flashcard.cards_in_pile}</Text>
        </View>
    )
}
