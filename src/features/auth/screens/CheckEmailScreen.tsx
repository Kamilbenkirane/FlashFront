import type {
  AuthCheckEmailMode,
  AuthStackScreenProps,
} from '@/app/navigation/types';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { useAuth } from '@/providers/AuthProvider';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

type CheckEmailScreenProps = AuthStackScreenProps<'CheckEmail'>;

const CheckEmailScreen: React.FC<CheckEmailScreenProps> = ({
  navigation,
  route,
}) => {
  const { pendingEmail, resendVerificationEmail, authError, clearAuthError } =
    useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(
    route.params?.message || null,
  );

  const mode = useMemo(
    (): AuthCheckEmailMode => route.params?.mode || 'verify',
    [route.params?.mode],
  );

  useEffect(() => {
    setNotice(route.params?.message || null);
  }, [mode, route.params?.message]);

  const handleResend = async () => {
    setIsSubmitting(true);
    const result = await resendVerificationEmail();
    setIsSubmitting(false);

    if (!result.error) {
      setNotice(result.message || 'We sent another email.');
    }
  };

  return (
    <AuthScaffold
      title="Check your email"
      subtitle={
        mode === 'reset'
          ? `We sent a reset link to ${pendingEmail || 'your inbox'}.`
          : `We sent a confirmation link to ${pendingEmail || 'your inbox'}.`
      }
      error={authError}
      notice={notice}
    >
      <View style={styles.actions}>
        {mode === 'verify' ? (
          <Button
            title="Resend email"
            size="lg"
            variant="outline"
            onPress={() => void handleResend()}
            loading={isSubmitting}
            fullWidth
          />
        ) : null}
        <Button
          title="Back to sign in"
          size="lg"
          onPress={() => {
            clearAuthError();
            navigation.navigate('Login');
          }}
          fullWidth
        />
        {mode === 'verify' ? (
          <Typography variant="caption" color="muted" style={styles.helperText}>
            After confirming your email, return here and sign in.
          </Typography>
        ) : (
          <Typography variant="caption" color="muted" style={styles.helperText}>
            Open the link on this device to finish resetting your password.
          </Typography>
        )}
      </View>
    </AuthScaffold>
  );
};

const styles = StyleSheet.create({
  actions: {
    gap: 12,
  },
  helperText: {
    textAlign: 'center',
  },
});

export default CheckEmailScreen;
