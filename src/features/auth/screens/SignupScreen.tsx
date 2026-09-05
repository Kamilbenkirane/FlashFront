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

type SignupScreenProps = AuthStackScreenProps<'Signup'>;

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const { signUp, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextErrors: typeof fieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!isValidEmail(email.trim().toLowerCase())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(email.trim().toLowerCase(), password);
    setIsSubmitting(false);

    if (result.error) {
      return;
    }

    if (result.requiresEmailConfirmation) {
      navigation.navigate('CheckEmail', {
        mode: 'verify',
      });
    }
  };

  return (
    <AuthScaffold
      title="Create account"
      onBack={() => {
        clearAuthError();
        navigation.goBack();
      }}
      error={authError}
      footer={
        <View style={styles.footerLinkRow}>
          <Pressable
            style={styles.footerLink}
            onPress={() => {
              clearAuthError();
              navigation.navigate('Login');
            }}
            accessibilityRole="button"
            accessibilityLabel="Sign in instead"
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Typography variant="caption" color="primary">
              Sign in
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
          if (fieldErrors.email) {
            setFieldErrors((current) => ({ ...current, email: undefined }));
          }
        }}
        placeholder="name@example.com"
        keyboardType="email-address"
        autoComplete="email"
        error={fieldErrors.email}
        returnKeyType="next"
      />
      <AuthTextField
        label="Password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearAuthError();
          if (fieldErrors.password) {
            setFieldErrors((current) => ({ ...current, password: undefined }));
          }
        }}
        placeholder="Create a password"
        autoComplete="new-password"
        secureTextEntry
        helperText="Use at least 8 characters."
        error={fieldErrors.password}
        returnKeyType="next"
      />
      <AuthTextField
        label="Confirm password"
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          clearAuthError();
          if (fieldErrors.confirmPassword) {
            setFieldErrors((current) => ({
              ...current,
              confirmPassword: undefined,
            }));
          }
        }}
        placeholder="Confirm password"
        autoComplete="new-password"
        secureTextEntry
        error={fieldErrors.confirmPassword}
        returnKeyType="done"
        onSubmitEditing={() => void handleSubmit()}
      />
      <View style={styles.actions}>
        <Button
          title="Create account"
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

export default SignupScreen;
