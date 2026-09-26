import AppNavigator from '@/app/navigation/AppNavigator';
import AuthNavigator from '@/app/navigation/AuthNavigator';
import OnboardingNavigator from '@/app/navigation/OnboardingNavigator';
import { FeedbackState } from '@/components/ui/FeedbackState/FeedbackState';
import { LoadingState } from '@/components/ui/LoadingState';
import { useAuth } from '@/providers/AuthProvider';
import { useUser } from '@/providers/UserProvider';
import { theme } from '@/tokens/theme';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import type React from 'react';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

// Local bootstrap (fonts, stored session, cached profile) takes a few tens of
// milliseconds; keeping the splash over it avoids a spinner flash. Past this
// delay the app shows its own loading state instead of a frozen splash.
const SPLASH_FALLBACK_MS = 2000;

const hideSplashScreen = () => {
  void SplashScreen.hideAsync().catch(() => undefined);
};

const RootNavigator: React.FC = () => {
  const { recoveryLinkVersion } = useAuth();

  return (
    <NavigationContainer
      key={recoveryLinkVersion}
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.foreground,
          border: theme.colors.border,
          primary: theme.colors.primary,
        },
      }}
    >
      <RootScreens />
    </NavigationContainer>
  );
};

const RootScreens: React.FC = () => {
  const { authLoading, session, requiresPasswordReset } = useAuth();
  const {
    user,
    userLoading,
    userError,
    onboardingLoading,
    onboardingComplete,
    refreshUser,
  } = useUser();

  const isBootstrapping =
    authLoading ||
    (!requiresPasswordReset &&
      Boolean(session) &&
      (userLoading || onboardingLoading));

  useEffect(() => {
    if (!isBootstrapping) {
      hideSplashScreen();
    }
  }, [isBootstrapping]);

  useEffect(() => {
    const timeout = setTimeout(hideSplashScreen, SPLASH_FALLBACK_MS);
    return () => clearTimeout(timeout);
  }, []);

  if (isBootstrapping) {
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
