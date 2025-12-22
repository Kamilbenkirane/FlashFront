import { useEffect, useState } from 'react';
import API_URL from '../config';
import type { Deck, User } from '../interfaces';

const useSubscribedDecks = (user: User | null): Deck[] => {
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    if (user?.user_id) {
      const fetchDecks = async () => {
        const url = `${API_URL}/subscription/${user?.user_id}`;
        const response = await fetch(url);
        const data = await response.json();
        setDecks(data);
      };
      fetchDecks();
    }
  }, [user]);

  return decks;
};

export default useSubscribedDecks;
