import AppNavigator from '@/app/navigation/AppNavigator';
import AuthNavigator from '@/app/navigation/AuthNavigator';
import OnboardingNavigator from '@/app/navigation/OnboardingNavigator';
import { FeedbackState } from '@/components/ui/FeedbackState/FeedbackState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/providers/UserProvider';
import type React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const RootNavigator: React.FC = () => {
  const { authLoading, session, requiresPasswordReset } = useAuth();
  const {
    user,
    userLoading,
    userError,
    onboardingLoading,
    onboardingComplete,
    refreshUser,
  } = useUser();

  if (authLoading || (session && (userLoading || onboardingLoading))) {
    return <LoadingState message="Preparing your workspace..." />;
  }

  if (requiresPasswordReset) {
    return <AuthNavigator initialRouteName="ResetPassword" />;
  }

  if (!session) {
    return <AuthNavigator />;
  }

  if (userError && !user) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <FeedbackState
          title="Couldn't load your account"
          description={userError}
          icon="cloudOff"
          actionLabel="Retry"
          onAction={() => void refreshUser()}
        />
      </SafeAreaView>
    );
  }

  if (!onboardingComplete) {
    return <OnboardingNavigator />;
  }

  return <AppNavigator />;
};

export default RootNavigator;
