import { useEffect, useState } from 'react';
import API_URL from '../config';

const useFlashcard = (id: number) => {
  const [flashcard, setFlashcard] = useState(null);
  useEffect(() => {
    const fetchFlashcard = async () => {
      const response = await fetch(`${API_URL}/flashcard/${id}`);
      const flashcard = await response.json();
      setFlashcard(flashcard);
    };
    fetchFlashcard();
  }, [id]);

  return flashcard;
};
export default useFlashcard;
