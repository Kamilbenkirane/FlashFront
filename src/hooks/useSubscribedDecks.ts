import { useEffect, useState } from 'react';
import API_URL from '../config';

const useSubscribedDecks = (user) => {
  const [decks, setDecks] = useState([]);
  console.log('useSubscribedDecks', user);

  useEffect(() => {
    if (user?.user_id) {
      const fetchDecks = async () => {
        console.log('fetching decks for user:', user?.user_id);
        const url = `${API_URL}/subscription/${user?.user_id}`;
        const response = await fetch(url); // Adjust endpoint as necessary
        const data = await response.json();
        setDecks(data);
      };
      fetchDecks();
    }
  }, [user]);

  return decks;
};

export default useSubscribedDecks;
