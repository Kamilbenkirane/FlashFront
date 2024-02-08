import { useEffect, useState } from 'react';
import API_URL from '../config';

const useSubscribedDecks = (userId) => {
    const [decks, setDecks] = useState([]);

    useEffect(() => {
        if (userId) {
            const fetchDecks = async () => {
                const response = await fetch(`${API_URL}/deck/list/${userId}`); // Adjust endpoint as necessary
                const data = await response.json();
                setDecks(data);
            };
            fetchDecks();
        }
    }, [userId]);

    return decks;
};

export default useSubscribedDecks;
