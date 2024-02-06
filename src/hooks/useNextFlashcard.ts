import { useEffect, useState } from "react";

const useNextFlashcard = (userId, activeDecksIds, triggerFetch) => {
    const [nextFlashcard, setNextFlashcard] = useState(null);

    useEffect(() => {
        console.log("activeDecksIds", triggerFetch)
        const queryParams = activeDecksIds.map(id => `active_decks_id=${id}`).join('&');
        const url = `http://127.0.0.1:5000/flashcard/next_card/${userId}?${queryParams}`;

        const fetchNextFlashcard = async () => {
            const response = await fetch(url);
            const flashcard = await response.json();
            setNextFlashcard(flashcard);
        };

        fetchNextFlashcard();
    }, [userId, activeDecksIds]);

    return nextFlashcard;
};

export default useNextFlashcard;
