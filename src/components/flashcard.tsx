import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { flashcardStyles } from "../styles/FlashcardStyles"; // Adjust the path as necessary

// Adjust the props to accept the entire flashcard object
export default function Flashcard({ flashcard }) {
    const [isRectoVisible, setIsRectoVisible] = useState(true); // State to manage which side is visible

    // Function to toggle between recto and verso
    const handlePress = () => {
        setIsRectoVisible(!isRectoVisible);
    };

    const backgroundColor = isRectoVisible ? '#e7f4ff' : '#e5fde6'; // Example colors: blue for recto, green for verso

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={[flashcardStyles.flashcard, { backgroundColor }]}>
                {/* Toggle between recto and verso based on isRectoVisible */}
                <Text style={flashcardStyles.flashcardHeader}>{isRectoVisible ? flashcard.recto : flashcard.verso}</Text>
                {/* The rest of the content */}
                <Text style={flashcardStyles.flashcardText}>{isRectoVisible ? "recto" : "verso"}</Text>
                {/* Displaying the streak */}
                <View style={flashcardStyles.streakCircle}>
                    <Text style={{color: 'black', textAlign: 'center'}}>{flashcard.popup_score}</Text>
                </View>
                {/* Optional: Other elements */}
                <View style={flashcardStyles.timeSinceReview} />
                <View style={flashcardStyles.popupScore} />
            </View>
        </TouchableOpacity>
    );
}
