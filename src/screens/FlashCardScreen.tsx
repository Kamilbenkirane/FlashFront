import React, { useEffect, useState } from 'react';
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
import { useUser } from '../context/UserContext';
import KnownButton from '../components/KnownButton';

const FlashcardScreen = () => {
  const users = useUsers();
  const { user, setUser } = useUser();
  const decks = useSubscribedDecks(user);
  const [activeDecksIds, setActiveDecksIds] = useState([]);
  const sessionData = useSessionData(user?.user_id, activeDecksIds);
  const session = useSession(sessionData);
  const [flashcard, setFlashcard] = useState(session?.getNextCard());

  useEffect(() => {
    const firstCard = session?.getNextCard();
    setFlashcard(firstCard);
  }, [session]);

  const [review_count, setReviewCount] = useState(0);
  useSyncLocalReviews(review_count);
  const handleUserSelect = (selectedUser = null) => {
    setUser(selectedUser);
  };
  const handleDeckSelect = (selectedDeckIds = []) => {
    setActiveDecksIds(selectedDeckIds);
  };
  const handleButtonPress = async (remembered = true) => {
    const currentFlashcard = flashcard;
    setFlashcard(session.getNextCard());
    setReviewCount(review_count + 1);
    await createReview(flashcard, remembered, user?.user_id);
    currentFlashcard && currentFlashcard.updateCard(remembered);
  };
  const handleKnownButtonPress = async () => {
    const currentFlashcard = flashcard;
    setFlashcard(session.getNextCard());
    setReviewCount(review_count + 1);
    currentFlashcard.streak += 5;
    await createReview(currentFlashcard, true, user?.user_id);
    currentFlashcard && currentFlashcard.updateCard(true);
  };

  return (
    <View>
      <UsersDropdown users={users} onSelectUser={handleUserSelect} />
      {user && (
        <DecksMultiSelect decks={decks} onSelectDecks={handleDeckSelect} />
      )}
      {flashcard && <Flashcard key={review_count} flashcard={flashcard} />}
      <View style={buttonContainer.container}>
        <ForgottenButton onPress={() => handleButtonPress(false)} />
        <KnownButton onPress={() => handleKnownButtonPress()} />
        <RememberedButton onPress={() => handleButtonPress(true)} />
      </View>
      {flashcard && <ReviewStats session={session} />}
    </View>
  );
};

export default FlashcardScreen;
