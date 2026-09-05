import { StorageAdapter } from '@/services/storage/StorageAdapter';

export interface OnboardingPreferences {
  completedAt: string;
  dailyGoal: number;
  reminderEnabled: boolean;
  selectedDeckIds: (string | number)[];
}

const onboardingStorage = new StorageAdapter(
  'onboarding-storage',
  'flashfront-onboarding-2026',
);

const getPreferencesKey = (identityId: string) => `preferences_${identityId}`;

export const getOnboardingPreferences = async (
  identityId: string,
): Promise<OnboardingPreferences | null> => {
  const stored = await onboardingStorage.getString(
    getPreferencesKey(identityId),
  );
  return stored ? (JSON.parse(stored) as OnboardingPreferences) : null;
};

export const saveOnboardingPreferences = async (
  identityId: string,
  preferences: OnboardingPreferences,
) => {
  await onboardingStorage.setString(
    getPreferencesKey(identityId),
    JSON.stringify(preferences),
  );
};

export const clearOnboardingPreferences = async (identityId: string) => {
  await onboardingStorage.removeString(getPreferencesKey(identityId));
};
