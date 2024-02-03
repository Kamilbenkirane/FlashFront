import {useEffect, useState} from "react";

const useFlashcard = (id: number) => {
    const [flashcard, setFlashcard] = useState(null);
    useEffect(() => {
        const fetchFlashcard = async () => {
            const response = await fetch(`http://127.0.0.1:5000/flashcard/${id}`)
            const flashcard = await response.json()
            setFlashcard(flashcard)
        }
        fetchFlashcard()
    }, [id]);

    return flashcard
}
export default useFlashcard;