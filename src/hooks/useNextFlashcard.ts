import { useEffect, useState } from "react";

const useNextFlashcard = (userId, activeDecksIds, fetchCount) => {
    const [nextFlashcard, setNextFlashcard] = useState(null);

    useEffect(() => {
        console.log("fetchCOunt", fetchCount)
        const queryParams = activeDecksIds.map(id => `active_decks_id=${id}`).join('&');
        const url = `http://127.0.0.1:5000/flashcard/next_card/${userId}?${queryParams}`;

        const fetchNextFlashcard = async () => {
            const response = await fetch(url);
            const flashcard = await response.json();
            console.log("flashcard", flashcard);
            setNextFlashcard(flashcard);
        };

        fetchNextFlashcard();
    }, [userId, activeDecksIds, fetchCount]);

    return nextFlashcard;
};

export default useNextFlashcard;
