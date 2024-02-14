// hooks/useSessionData.js
import { useState, useEffect } from "react";
import API_URL from "../config";

const useSessionData = (userId, activeDecksIds) => {
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    if (userId && activeDecksIds.length > 0) {
      const queryParams = activeDecksIds
        .map((id) => `active_decks_id=${id}`)
        .join("&");
      const url = `${API_URL}/stack/get_session_df/${userId}?${queryParams}`;
      const fetchSessionData = async () => {
        try {
          console.log("fetching Data, API_URL:", `${url}`);
          const response = await fetch(url);
          const sessionData = await response.json();
          setSessionData(sessionData);
        } catch (error) {
          console.error("Failed to fetch session data", error);
        }
      };

      fetchSessionData();
    }
  }, [userId, activeDecksIds]);

  return sessionData;
};

export default useSessionData;
