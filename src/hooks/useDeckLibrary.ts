import { useEffect, useState } from 'react';
import API_URL from '../config';

type Deck = {
  id: string;
  deck_name: string;
  subject: string;
  // include other properties as needed
};

const useDeckLibrary = (): Deck[] => {
  const [decks, setDecks] = useState([]);

  useEffect(() => {
    const fetchDecks = async () => {
      const response = await fetch(`${API_URL}/deck/list/`); // Adjust endpoint as necessary
      const data = await response.json();
      setDecks(data);
    };
    fetchDecks();
  });

  return decks;
};

export default useDeckLibrary;
