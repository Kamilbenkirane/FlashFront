import type { AuthStackScreenProps } from '@/app/navigation/types';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { AuthTextField } from '@/features/auth/components/AuthTextField';
import { useAuth } from '@/providers/AuthProvider';
import type React from 'react';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

type LoginScreenProps = AuthStackScreenProps<'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, route }) => {
  const { signIn, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const successMessage = useMemo(
    () => route.params?.message || null,
    [route.params?.message],
  );

  const handleSubmit = async () => {
    const nextErrors: typeof fieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!isValidEmail(email.trim().toLowerCase())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email.trim().toLowerCase(), password);
    setIsSubmitting(false);

    if (!result.error) {
      return;
    }
  };

  return (
    <AuthScaffold
      title="Sign in"
      onBack={() => {
        clearAuthError();
        navigation.goBack();
      }}
      error={authError}
      notice={successMessage}
      footer={
        <View style={styles.footerLinkRow}>
          <Pressable
            style={styles.footerLink}
            onPress={() => {
              clearAuthError();
              navigation.navigate('Signup');
            }}
            accessibilityRole="button"
            accessibilityLabel="Create an account"
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Typography variant="caption" color="primary">
              Create account
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
        placeholder="Password"
        autoComplete="current-password"
        secureTextEntry
        error={fieldErrors.password}
        returnKeyType="done"
        onSubmitEditing={() => void handleSubmit()}
      />
      <View style={styles.actions}>
        <Button
          title="Sign in"
          size="lg"
          onPress={() => void handleSubmit()}
          loading={isSubmitting}
          fullWidth
        />
        <Button
          title="Forgot password?"
          size="lg"
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

export default LoginScreen;
