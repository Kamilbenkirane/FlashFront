import { useEffect, useState } from "react";
import API_URL from "../config";

const useNextFlashcard = (userId, activeDecksIds, fetchCount) => {
    const [nextFlashcard, setNextFlashcard] = useState(null);

    useEffect(() => {
        console.log(API_URL)
        console.log("fetchCOunt", fetchCount)
        const queryParams = activeDecksIds.map(id => `active_decks_id=${id}`).join('&');
        const url = `${API_URL}/stack/next_card/${userId}?${queryParams}`;
        const fetchNextFlashcard = async () => {
            console.log("url", url);
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
