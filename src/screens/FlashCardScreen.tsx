import React, {useEffect, useState} from 'react';
import { View, Text } from 'react-native';
import Flashcard from "../components/flashcard"; // Adjust the import path
import useUser from "../hooks/useUser";
import RememberedButton from "../components/remembered_button";
import ForgottenButton from "../components/forgotten_button";
import {buttonContainer} from "../styles/Buttons";
import useNextFlashcard from "../hooks/useNextFlashcard";
import createReview from "../functions/createReview";


const FlashcardScreen = () => {
    const user = useUser(1);
    const [activeDecksIds, setActiveDecksIds] = useState([0]);
    const [fetchCount, setFetchCount] = useState(0);
    const flashcard = useNextFlashcard(user?.user_id, activeDecksIds, fetchCount);

    const handleButtonPress = async (remembered) => {
        console.log("creating review", remembered);
        // First create the review
        const reviewResponse = await createReview(flashcard, remembered, user?.user_id);
        // Handle the response from creating a review
        console.log("Review response:", reviewResponse);

        // Update the flashcard and Create a review
        console.log("count: ", fetchCount );
        setFetchCount(prevCount => prevCount + 1);
    }

    return (
        <View>
            {user ? <Text>Welcome {user.first_name}</Text> : <Text>Loading...</Text>}
            {flashcard && <Flashcard flashcard={flashcard} />}
            <View style={buttonContainer.container}>
                <ForgottenButton onPress={() => handleButtonPress( false) }/>
                <RememberedButton onPress={() => handleButtonPress( true)}/>
            </View>
        </View>
    );
};

export default FlashcardScreen;