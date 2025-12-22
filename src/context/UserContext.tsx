// UserContext.js
import type React from 'react';
import { type ReactNode, createContext, useContext, useState } from 'react';

// Define User interface
export interface User {
  user_id: number | string;
  user_name: string;
  name?: string;
  iteration?: number;
  subscription_date?: string;
}

// Define context type
interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Create context with proper typing
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider props interface
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook with proper error handling
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
