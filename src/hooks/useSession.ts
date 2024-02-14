import { useEffect, useState } from "react";
import Session from "../models/Session";

// Assuming that `sessionId` is a number or string that uniquely identifies the session
const useSession = (sessionData) => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (sessionData) {
      const loadSession = async () => {
        // use model Session(sessionData) to create a new session object
        const session = new Session(sessionData);
        setSession(session);
      };
      loadSession();
    }
  }, [sessionData]);

  return session;
};
export default useSession;
