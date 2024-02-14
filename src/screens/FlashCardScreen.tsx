import React, { useState } from 'react';
import { View } from 'react-native';
import Flashcard from '../components/flashcard'; // Adjust the import path
import RememberedButton from '../components/remembered_button';
import ForgottenButton from '../components/forgotten_button';
import { buttonContainer } from '../styles/Buttons';
import createReview from '../functions/createReview';
import ReviewStats from '../components/review_stats';
import useUsers from '../hooks/useUsers';
import UsersDropdown from '../components/UsersDropdown';
import useSubscribedDecks from '../hooks/useSubscribedDecks';
import DecksMultiSelect from '../components/DecksMultiSelect';
import useSessionData from '../hooks/useSessionData';
import useSession from '../hooks/useSession';
import useSyncLocalReviews from '../hooks/useSyncLocalReviews';

const FlashcardScreen = () => {
  console.log('Rendering FlashcardScreen');
  const users = useUsers();
  console.log('fetching users');
  const [user, setUser] = useState(null);

  const decks = useSubscribedDecks(user?.user_id);
  // use decks from 0 to 80 as initial active decks
  const [activeDecksIds, setActiveDecksIds] = useState(
    Array.from({ length: 80 }, (_, i) => i),
  );

  const sessionData = useSessionData(user?.user_id, activeDecksIds);
  const session = useSession(sessionData);
  const [flashcard, setFlashcard] = useState(session?.getNextCard());

  // Sync Local Reviews
  useSyncLocalReviews();

  const handleUserSelect = (selectedUser = null) => {
    setUser(selectedUser);
  };

  const handleDeckSelect = (selectedDeckIds = []) => {
    // Ensure we're setting an array here, even if it's with a single ID
    setActiveDecksIds(selectedDeckIds);
  };

  const handleButtonPress = async (remembered = true) => {
    // console.log("creating review", remembered);

    // First create the review
    const reviewResponse = await createReview(
      flashcard,
      remembered,
      user?.user_id,
    );
    console.log('reviewResponse', reviewResponse);

    // update the flashcard
    flashcard && flashcard.updateCard(remembered);
    setFlashcard(session.getNextCard());
  };

  return (
    <View>
      <UsersDropdown users={users} onSelectUser={handleUserSelect} />
      {user && (
        <DecksMultiSelect decks={decks} onSelectDecks={handleDeckSelect} />
      )}
      {flashcard && <Flashcard flashcard={flashcard} />}
      <View style={buttonContainer.container}>
        <ForgottenButton onPress={() => handleButtonPress(false)} />
        <RememberedButton onPress={() => handleButtonPress(true)} />
      </View>
      {flashcard && <ReviewStats session={session} />}
    </View>
  );
};

export default FlashcardScreen;
