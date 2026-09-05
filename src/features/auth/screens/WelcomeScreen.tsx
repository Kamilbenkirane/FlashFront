import type { AuthStackScreenProps } from '@/app/navigation/types';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { useAuth } from '@/providers/AuthProvider';
import type React from 'react';
import { StyleSheet, View } from 'react-native';

type WelcomeScreenProps = AuthStackScreenProps<'Welcome'>;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { authError, clearAuthError } = useAuth();

  return (
    <AuthScaffold
      title="Welcome back"
      subtitle="Create an account to sync decks, keep your progress, and use FlashFront across devices."
      error={authError}
      footer={
        <Typography variant="small" color="muted" style={styles.footerText}>
          By continuing you agree to use FlashFront with a personal account
          instead of a shared device profile.
        </Typography>
      }
    >
      <View style={styles.actions}>
        <Button
          title="Create account"
          onPress={() => {
            clearAuthError();
            navigation.navigate('Signup');
          }}
          fullWidth
        />
        <Button
          title="Sign in"
          variant="outline"
          onPress={() => {
            clearAuthError();
            navigation.navigate('Login');
          }}
          fullWidth
        />
        <Button
          title="Forgot password?"
          variant="ghost"
          onPress={() => {
            clearAuthError();
            navigation.navigate('ForgotPassword');
          }}
          fullWidth
        />
      </View>
    </AuthScaffold>
  );
};

const styles = StyleSheet.create({
  actions: {
    gap: 12,
  },
  footerText: {
    textAlign: 'center',
  },
});

export default WelcomeScreen;
