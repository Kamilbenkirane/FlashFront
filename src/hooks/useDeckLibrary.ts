import { useEffect, useState } from 'react';
import API_URL from '../config';
import type { Deck } from '../interfaces';

const useDeckLibrary = (): Deck[] => {
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    const fetchDecks = async () => {
      const response = await fetch(`${API_URL}/deck/list/`); // Adjust endpoint as necessary
      const data = await response.json();
      setDecks(data);
    };
    fetchDecks();
  }, []);

  return decks;
};

export default useDeckLibrary;
