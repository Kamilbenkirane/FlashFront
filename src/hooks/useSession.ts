import { useEffect, useState } from 'react';
import type { SessionData } from '../interfaces';
import Session from '../models/Session';

// Hook for managing session state with proper typing
const useSession = (
  sessionData: SessionData[] | null | undefined,
): Session | null => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (sessionData) {
      const loadSession = async () => {
        // use model Session(sessionData) to create a new session object
        const newSession = new Session(sessionData);
        setSession(newSession);
      };
      loadSession();
    }
  }, [sessionData]);

  return session;
};

export default useSession;
