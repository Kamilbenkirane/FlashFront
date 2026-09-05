import type { AuthStackScreenProps } from '@/app/navigation/types';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { AuthTextField } from '@/features/auth/components/AuthTextField';
import { useAuth } from '@/providers/AuthProvider';
import type React from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

type ForgotPasswordScreenProps = AuthStackScreenProps<'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const { sendPasswordReset, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }

    if (!isValidEmail(email.trim().toLowerCase())) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setEmailError(null);
    setIsSubmitting(true);
    const result = await sendPasswordReset(email.trim().toLowerCase());
    setIsSubmitting(false);

    if (result.error) {
      return;
    }

    navigation.navigate('CheckEmail', {
      mode: 'reset',
      message: result.message,
    });
  };

  return (
    <AuthScaffold
      title="Reset your password."
      subtitle="We’ll email you a secure link so you can choose a new password."
      onBack={() => {
        clearAuthError();
        navigation.goBack();
      }}
      error={authError}
      footer={
        <View style={styles.footerLinkRow}>
          <Typography variant="caption" color="muted">
            Remembered it?
          </Typography>
          <Pressable
            style={styles.footerLink}
            onPress={() => {
              clearAuthError();
              navigation.navigate('Login');
            }}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Typography variant="caption" color="primary">
              Back to sign in
            </Typography>
          </Pressable>
        </View>
      }
    >
      <AuthTextField
        label="Email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          clearAuthError();
          if (emailError) {
            setEmailError(null);
          }
        }}
        placeholder="name@example.com"
        keyboardType="email-address"
        autoComplete="email"
        error={emailError}
        returnKeyType="done"
        onSubmitEditing={() => void handleSubmit()}
      />
      <View style={styles.actions}>
        <Button
          title="Send reset link"
          size="lg"
          onPress={() => void handleSubmit()}
          loading={isSubmitting}
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
  footerLinkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  footerLink: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});

export default ForgotPasswordScreen;
