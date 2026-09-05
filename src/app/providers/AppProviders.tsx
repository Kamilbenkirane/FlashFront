import { OutboxSync } from '@/components/OutboxSync';
import { AuthProvider } from '@/providers/AuthProvider';
import { UserProvider } from '@/providers/UserProvider';
import type React from 'react';
import type { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AuthProvider>
      <UserProvider>
        <OutboxSync />
        {children}
      </UserProvider>
    </AuthProvider>
  );
};
