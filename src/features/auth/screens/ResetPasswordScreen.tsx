import type { AuthStackScreenProps } from '@/app/navigation/types';
import { Button } from '@/components/ui/Button';
import { AuthScaffold } from '@/features/auth/components/AuthScaffold';
import { AuthTextField } from '@/features/auth/components/AuthTextField';
import { useAuth } from '@/providers/AuthProvider';
import type React from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

type ResetPasswordScreenProps = AuthStackScreenProps<'ResetPassword'>;

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  navigation,
}) => {
  const { updatePassword, authError, clearAuthError } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const nextErrors: typeof fieldErrors = {};

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
    const result = await updatePassword(password);
    setIsSubmitting(false);

    if (result.error) {
      return;
    }

    clearAuthError();
    navigation.navigate('Login', {
      message: result.message,
    });
  };

  return (
    <AuthScaffold
      title="Choose a new password"
      subtitle="Pick a new password for your FlashFront account."
      error={authError}
    >
      <AuthTextField
        label="New password"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          clearAuthError();
          if (fieldErrors.password) {
            setFieldErrors((current) => ({ ...current, password: undefined }));
          }
        }}
        placeholder="New password"
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
        placeholder="Repeat your password"
        autoComplete="new-password"
        secureTextEntry
        error={fieldErrors.confirmPassword}
        returnKeyType="done"
        onSubmitEditing={() => void handleSubmit()}
      />
      <View style={styles.actions}>
        <Button
          title="Save new password"
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
});

export default ResetPasswordScreen;
