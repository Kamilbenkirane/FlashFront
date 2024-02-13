import React, {useEffect, useState} from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { flashcardStyles } from "../styles/FlashcardStyles"; // Adjust the path as necessary

// Adjust the props to accept the entire flashcard object
export default function Flashcard({ flashcard }) {
    const [isRectoVisible, setIsRectoVisible] = useState(true); // State to manage which side is visible

    // Function to toggle between recto and verso
    const handlePress = () => {
        setIsRectoVisible(!isRectoVisible);
    };

    // useEffect hook to reset isRectoVisible to true when the flashcard prop changes
    useEffect(() => {
        setIsRectoVisible(true);
    }, [flashcard]);

    // Function to format the time since the last review
    const formatTimeSinceLastReview = (seconds) => {
        if (seconds === undefined) return "No Review"; // Handle null case
        if (seconds < 60) {
            return `${seconds} sec`;
        } else if (seconds < 3600) {
            return `${Math.floor(seconds / 60)} min`;
        } else if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${minutes}min`;
        } else {
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            return `${days}d ${hours}h`;
        }
    };

    // Function to format the popupScore as a percentage
    const formatPopupScore = (score) => {
        return `${(score * 100).toFixed(2)}%`; // Convert to percentage and format to 2 decimal places
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
                    <Text style={{color: 'black', textAlign: 'center'}}>{flashcard.streak}</Text>
                </View>
                {/* Optional: Other elements */}
                <View style={flashcardStyles.timeSinceReview}>
                    <Text style={{color: 'black', textAlign: 'center'}}>
                        {formatTimeSinceLastReview(flashcard.secondsSinceLastReview)}
                    </Text>
                </View>
                <View style={flashcardStyles.popupScore} >
                    <Text style={{color: 'black', textAlign: 'center'}}>
                        {formatPopupScore(flashcard.popupScore)}
                    </Text>
                </View>

            </View>
        </TouchableOpacity>
    );
}
