import React, {useState} from 'react';
import { View, Text } from 'react-native';
import Flashcard from "../components/flashcard"; // Adjust the import path
import useUser from "../hooks/useUser";
import useFlashcard from "../hooks/useFlashcard";
import RememberedButton from "../components/remembered_button";
import ForgottenButton from "../components/forgotten_button";
import {buttonContainer} from "../styles/Buttons";

const FlashcardScreen = () => {
    const user = useUser(1);
    const [flashcardId, setFlashcardId] = useState(0);
    const flashcard = useFlashcard(flashcardId);

    // Function to go to the next flashcard
    const goToNextFlashcard = () => {
        // Increment the flashcard ID to get the next card
        // Assuming you have a way to determine the last flashcard ID,
        // you might want to add logic to reset or loop through flashcards
        setFlashcardId(currentId => currentId + 1);
    };

    return (
        <View>
            {user ? <Text>Welcome {user.first_name}</Text> : <Text>Loading...</Text>}
            {flashcard && <Flashcard flashcard={flashcard} />}
            <View style={buttonContainer.container}>
                <ForgottenButton onPress={goToNextFlashcard} />
                <RememberedButton onPress={goToNextFlashcard} />

            </View>
        </View>
    );
};

export default FlashcardScreen;
