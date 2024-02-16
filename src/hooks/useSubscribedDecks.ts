import { useEffect, useState } from 'react';
import API_URL from '../config';

const useSubscribedDecks = (userId) => {
  const [decks, setDecks] = useState([]);
  console.log('useSubscribedDecks', userId);

  useEffect(() => {
    if (userId) {
      const fetchDecks = async () => {
        console.log('fetching decks for user:', userId);
        const response = await fetch(`${API_URL}/subscription/${userId}`); // Adjust endpoint as necessary
        const data = await response.json();
        setDecks(data);
      };
      fetchDecks();
    }
  }, [userId]);

  return decks;
};

export default useSubscribedDecks;
