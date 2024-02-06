import React, {useEffect, useState} from 'react';
import { View, Text } from 'react-native';
import Flashcard from "../components/flashcard"; // Adjust the import path
import useUser from "../hooks/useUser";
import RememberedButton from "../components/remembered_button";
import ForgottenButton from "../components/forgotten_button";
import {buttonContainer} from "../styles/Buttons";
import useNextFlashcard from "../hooks/useNextFlashcard";
import useCreateReview from "../hooks/useCreateReview";

const FlashcardScreen = () => {
    const user = useUser(1);
    const [activeDecksIds, setActiveDecksIds] = useState([0]);
    const [flashcard, setFlashcard] = useState(null);
    const [triggerFetch, setTriggerFetch] = useState(false);

    useEffect(() => {
        if (user?.user_id) {
            const fetchFlashcard = async () => {
                const initialFlashcard = await useNextFlashcard(user.user_id, activeDecksIds);
                setFlashcard(initialFlashcard);
            };
            fetchFlashcard();
        }
    }, [user, activeDecksIds, triggerFetch]); // Add triggerFetch to the dependency array

    const handleButtonPress = (remembered) => {
        //useCreateReview(flashcard.flashcard_id, remembered);

        // Update the flashcard
        setTriggerFetch(!triggerFetch);
    }

    return (
        <View>
            {user ? <Text>Welcome {user.first_name}</Text> : <Text>Loading...</Text>}
            {flashcard && <Flashcard flashcard={flashcard} />}
            <View style={buttonContainer.container}>
                <ForgottenButton onPress={() => handleButtonPress( false)}/>
                <RememberedButton onPress={() => handleButtonPress( true)}/>

            </View>
        </View>
    );
};

export default FlashcardScreen;
