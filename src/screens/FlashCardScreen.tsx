import React, {useEffect, useState} from 'react';
import { View, Text } from 'react-native';
import Flashcard from "../components/flashcard"; // Adjust the import path
import useUser from "../hooks/useUser";
import RememberedButton from "../components/remembered_button";
import ForgottenButton from "../components/forgotten_button";
import {buttonContainer} from "../styles/Buttons";
import useNextFlashcard from "../hooks/useNextFlashcard";
import createReview from "../functions/createReview";
import ReviewStats from "../components/review_stats";
import useUsers from "../hooks/useUsers";
import UsersDropdown from "../components/UsersDropdown";
import useSubscribedDecks from "../hooks/useSubscribedDecks";
import DecksMultiSelect from "../components/DecksMultiSelect";


const FlashcardScreen = () => {
    const users = useUsers();
    const [user, setUser] = useState(null);
    const decks = useSubscribedDecks(user?.user_id);
    // use decks from 0 to 80 as initial active decks
    const [activeDecksIds, setActiveDecksIds] = useState(Array.from({length: 80}, (_, i) => i));
    const [fetchCount, setFetchCount] = useState(0);
    const flashcard = useNextFlashcard(user?.user_id, activeDecksIds, fetchCount);

    const handleUserSelect = (selectedUser) => {
        setUser(selectedUser);
    }

    const handleDeckSelect = (selectedDeckIds) => {
        // Ensure we're setting an array here, even if it's with a single ID
        setActiveDecksIds(selectedDeckIds);
    };


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
            <UsersDropdown users={users} onSelectUser={handleUserSelect} />
            {user && <DecksMultiSelect decks={decks} onSelectDecks={handleDeckSelect} />}
            {flashcard && <Flashcard flashcard={flashcard} />}
            <View style={buttonContainer.container}>
                <ForgottenButton onPress={() => handleButtonPress( false) }/>
                <RememberedButton onPress={() => handleButtonPress( true)}/>
            </View>
            {flashcard && <ReviewStats flashcard={flashcard} />}
        </View>
    );
};

export default FlashcardScreen;