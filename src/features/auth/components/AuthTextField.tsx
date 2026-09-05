import { Typography } from '@/components/ui/Typography';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useState } from 'react';
import {
  type KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

interface AuthTextFieldProps
  extends Pick<
    TextInputProps,
    'autoCapitalize' | 'onSubmitEditing' | 'returnKeyType'
  > {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string | null;
  helperText?: string;
  keyboardType?: KeyboardTypeOptions;
  autoComplete?: TextInputProps['autoComplete'];
  secureTextEntry?: boolean;
  autoCorrect?: boolean;
}

export const AuthTextField: React.FC<AuthTextFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  keyboardType,
  autoComplete,
  secureTextEntry = false,
  autoCapitalize = 'none',
  autoCorrect = false,
  onSubmitEditing,
  returnKeyType,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isSecureField = secureTextEntry;

  return (
    <View style={styles.container}>
      <Typography variant="caption" style={styles.label}>
        {label}
      </Typography>

      <View
        style={[
          styles.inputRow,
          isFocused && styles.inputFocused,
          error ? styles.inputError : undefined,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.placeholder}
          style={styles.input}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          secureTextEntry={isSecureField && !isPasswordVisible}
          accessibilityLabel={label}
          accessibilityHint={error || helperText || placeholder}
          selectionColor={theme.colors.primary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
        />
        {isSecureField ? (
          <Pressable
            onPress={() => setIsPasswordVisible((current) => !current)}
            style={styles.visibilityToggle}
            accessibilityRole="button"
            accessibilityLabel={`${isPasswordVisible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            accessibilityHint={
              isPasswordVisible
                ? 'Hides the password characters'
                : 'Shows the password characters'
            }
          >
            <Typography variant="caption" color="primary">
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Typography>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Typography
          variant="caption"
          color="error"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Typography>
      ) : helperText ? (
        <Typography variant="caption" color="muted">
          {helperText}
        </Typography>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  label: {
    fontFamily: theme.fontFamily.medium,
  },
  visibilityToggle: {
    minHeight: 52,
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.foreground,
    fontFamily: theme.fontFamily.sans,
    fontSize: 16,
    lineHeight: 22,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
  },
  inputError: {
    borderColor: theme.colors.destructive.DEFAULT,
  },
});
