// hooks/useSessionData.js
import { useEffect, useState } from 'react';
import API_URL from '../config';
import type { SessionData } from '../interfaces';

const useSessionData = (
  userId: string | number | undefined,
  activeDecksIds: (string | number)[],
): SessionData[] | null => {
  const [sessionData, setSessionData] = useState<SessionData[] | null>(null);

  useEffect(() => {
    if (userId && activeDecksIds.length > 0) {
      const queryParams = activeDecksIds
        .map((id) => `active_decks_id=${id}`)
        .join('&');
      const url = `${API_URL}/stack/get_session_df/${userId}?${queryParams}`;
      const fetchSessionData = async () => {
        try {
          const response = await fetch(url);
          const sessionData = await response.json();
          setSessionData(sessionData);
        } catch (error) {
          // Silent failure - session data fetch failed
        }
      };

      fetchSessionData();
    }
  }, [userId, activeDecksIds]);

  return sessionData;
};

export default useSessionData;
