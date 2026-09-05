import type { OnboardingPreferences } from '@/services/auth/onboardingStorage';
import {
  clearOnboardingPreferences,
  getOnboardingPreferences,
  saveOnboardingPreferences,
} from '@/services/auth/onboardingStorage';
import {
  createCurrentUserRequest,
  deleteCurrentUserAccountRequest,
  getCurrentUserRequest,
} from '@/services/backendClient';
import { createDeckSubscription } from '@/services/subscriptions/subscriptionService';
import { getErrorMessage } from '@/utils/errorMessage';
import type React from 'react';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthProvider';

export interface User {
  user_id: number | string;
  user_name: string;
  email?: string;
  subscription_date?: string;
}

interface CompleteOnboardingInput {
  displayName: string;
  selectedDeckIds: (string | number)[];
  dailyGoal: number;
  reminderEnabled: boolean;
}

interface UserMutationResult {
  error: string | null;
}

interface UserContextType {
  user: User | null;
  userLoading: boolean;
  userError: string | null;
  onboardingPreferences: OnboardingPreferences | null;
  onboardingLoading: boolean;
  onboardingComplete: boolean;
  refreshUser: () => Promise<void>;
  completeOnboarding: (
    input: CompleteOnboardingInput,
  ) => Promise<UserMutationResult>;
  deleteAccount: () => Promise<UserMutationResult>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { authLoading, authUser, session } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);
  const [onboardingPreferences, setOnboardingPreferences] =
    useState<OnboardingPreferences | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!session || !authUser) {
      setUser(null);
      setUserLoading(false);
      setUserError(null);
      return;
    }

    setUserLoading(true);
    setUserError(null);

    const nextUser = await getCurrentUserRequest().catch((error: unknown) => {
      setUserError(getErrorMessage(error, 'Could not load your profile.'));
      return null;
    });

    setUser(nextUser);
    setUserLoading(false);
  }, [authUser, session]);

  const refreshOnboarding = useCallback(async () => {
    if (!authUser) {
      setOnboardingPreferences(null);
      setOnboardingLoading(false);
      return;
    }

    setOnboardingLoading(true);
    const identityId = authUser.id;
    const nextPreferences = await getOnboardingPreferences(identityId);
    setOnboardingPreferences(nextPreferences);
    setOnboardingLoading(false);
  }, [authUser]);

  const completeOnboarding = useCallback(
    async (input: CompleteOnboardingInput): Promise<UserMutationResult> => {
      if (!authUser?.email) {
        return { error: 'Sign in before completing onboarding.' };
      }

      const displayName = input.displayName.trim();
      if (!displayName) {
        return { error: 'Enter a display name to continue.' };
      }

      let nextUser = user;
      if (!nextUser) {
        const [firstName] = displayName.split(/\s+/);
        const createdUser = await createCurrentUserRequest({
          user_name: displayName,
          first_name: firstName || displayName,
        }).catch((error: unknown) => {
          const nextError = getErrorMessage(
            error,
            'Could not save your study profile.',
          );
          setUserError(nextError);
          return null;
        });

        if (!createdUser) {
          return {
            error: 'Could not save your study profile.',
          };
        }

        nextUser = createdUser;
        setUser(createdUser);
      }

      for (const deckId of input.selectedDeckIds) {
        const createdSubscription = await createDeckSubscription(deckId).catch(
          (error: unknown) => {
            const nextError = getErrorMessage(
              error,
              'Could not subscribe to your starter decks.',
            );
            setUserError(nextError);
            return null;
          },
        );

        if (!createdSubscription) {
          return {
            error: 'Could not subscribe to your starter decks.',
          };
        }
      }

      const nextPreferences: OnboardingPreferences = {
        completedAt: new Date().toISOString(),
        dailyGoal: input.dailyGoal,
        reminderEnabled: input.reminderEnabled,
        selectedDeckIds: input.selectedDeckIds,
      };

      await saveOnboardingPreferences(authUser.id, nextPreferences);
      setOnboardingPreferences(nextPreferences);
      setUserError(null);
      return { error: null };
    },
    [authUser, user],
  );

  const deleteAccount = useCallback(async (): Promise<UserMutationResult> => {
    if (!authUser) {
      return { error: 'Sign in before deleting your account.' };
    }

    const deleteError = await deleteCurrentUserAccountRequest().catch(
      (error: unknown) => {
        const nextError = getErrorMessage(
          error,
          'Could not delete your account.',
        );
        setUserError(nextError);
        return nextError;
      },
    );

    if (typeof deleteError === 'string') {
      return { error: deleteError };
    }

    await clearOnboardingPreferences(authUser.id);
    setOnboardingPreferences(null);
    setUser(null);
    setUserError(null);
    return { error: null };
  }, [authUser]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void refreshUser();
  }, [authLoading, refreshUser]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    void refreshOnboarding();
  }, [authLoading, refreshOnboarding]);

  const onboardingComplete = useMemo(
    () => Boolean(user && onboardingPreferences),
    [onboardingPreferences, user],
  );

  return (
    <UserContext.Provider
      value={{
        user,
        userLoading,
        userError,
        onboardingPreferences,
        onboardingLoading,
        onboardingComplete,
        refreshUser,
        completeOnboarding,
        deleteAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
