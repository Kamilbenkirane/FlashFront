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
      setSession(new Session(sessionData));
    }
  }, [sessionData]);

  return session;
};

export default useSession;
