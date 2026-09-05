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
  const isSecureField = secureTextEntry;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Typography variant="caption" color="muted">
          {label}
        </Typography>
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
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Typography variant="caption" color="primary">
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Typography>
          </Pressable>
        ) : null}
      </View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        style={[styles.input, error ? styles.inputError : undefined]}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        secureTextEntry={isSecureField && !isPasswordVisible}
        accessibilityLabel={label}
        accessibilityHint={error || helperText || placeholder}
        onSubmitEditing={onSubmitEditing}
        returnKeyType={returnKeyType}
      />

      {error ? (
        <Typography
          variant="small"
          color="error"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Typography>
      ) : helperText ? (
        <Typography variant="small" color="muted">
          {helperText}
        </Typography>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  visibilityToggle: {
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
    marginRight: -theme.spacing.xs,
  },
  input: {
    minHeight: 48,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.foreground,
    fontFamily: theme.fontFamily.sans,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
  },
  inputError: {
    borderColor: theme.colors.destructive.DEFAULT,
  },
});
