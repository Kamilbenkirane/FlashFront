import useReducedMotion from '@/hooks/useReducedMotion';
import { theme } from '@/tokens/theme';
import { MotiPressable } from 'moti/interactions';
import type React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import type { ButtonProps, ButtonSize } from './Button.types';

const sizeConfig: Record<
  ButtonSize,
  {
    minHeight: number;
    paddingHorizontal: number;
    paddingVertical: number;
    textStyle: {
      fontSize: number;
      lineHeight: number;
    };
  }
> = {
  sm: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 7,
    textStyle: {
      fontSize: 13,
      lineHeight: 22,
    },
  },
  md: {
    minHeight: 50,
    paddingHorizontal: 16,
    paddingVertical: 9,
    textStyle: {
      fontSize: 15,
      lineHeight: 22,
    },
  },
  lg: {
    minHeight: 56,
    paddingHorizontal: 20,
    paddingVertical: 10,
    textStyle: {
      fontSize: 15,
      lineHeight: 22,
    },
  },
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  testID,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  hitSlop,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const isDisabled = disabled || loading;
  const resolvedAccessibilityState = {
    ...accessibilityState,
    disabled: isDisabled,
    busy: loading || accessibilityState?.busy,
  };
  const resolvedHitSlop =
    hitSlop ??
    (size === 'sm'
      ? { top: 6, right: 6, bottom: 6, left: 6 }
      : { top: 4, right: 4, bottom: 4, left: 4 });

  const handlePress = () => {
    if (!isDisabled) {
      onPress();
    }
  };

  const variantStyles = {
    primary: styles.variantPrimary,
    secondary: styles.variantSecondary,
    outline: styles.variantOutline,
    success: styles.variantSuccess,
    error: styles.variantError,
    ghost: styles.variantGhost,
  };

  const textColors = {
    primary: theme.colors.primaryForeground,
    secondary: theme.colors.secondaryForeground,
    outline: theme.colors.foreground,
    success: theme.colors.success.DEFAULT,
    error: theme.colors.destructive.DEFAULT,
    ghost: theme.colors.primary,
  };

  return (
    <View style={fullWidth ? styles.fullWidth : undefined}>
      <MotiPressable
        style={styles.pressable}
        onPress={handlePress}
        disabled={isDisabled}
        testID={testID}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={resolvedAccessibilityState}
        hitSlop={resolvedHitSlop}
        animate={({ hovered, pressed }) => {
          'worklet';
          return {
            scale: prefersReducedMotion || isDisabled ? 1 : pressed ? 0.98 : 1,
          };
        }}
        transition={{
          ...(prefersReducedMotion
            ? { type: 'timing' as const, duration: 0 }
            : {
                type: 'spring' as const,
                damping: 18,
                stiffness: 260,
                mass: 1,
              }),
        }}
      >
        <View
          style={[
            styles.base,
            variantStyles[variant],
            {
              minHeight: sizeConfig[size].minHeight,
              paddingHorizontal: sizeConfig[size].paddingHorizontal,
              paddingVertical: sizeConfig[size].paddingVertical,
            },
            isDisabled && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={theme.colors.mutedForeground}
            />
          ) : (
            <View style={styles.content}>
              {icon && iconPosition === 'left' && (
                <View style={styles.iconLeft}>{icon}</View>
              )}
              <Text
                style={[
                  styles.text,
                  {
                    color: isDisabled
                      ? theme.colors.mutedForeground
                      : textColors[variant],
                    fontSize: sizeConfig[size].textStyle.fontSize,
                    lineHeight: sizeConfig[size].textStyle.lineHeight,
                  },
                ]}
              >
                {title}
              </Text>
              {icon && iconPosition === 'right' && (
                <View style={styles.iconRight}>{icon}</View>
              )}
            </View>
          )}
        </View>
      </MotiPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  pressable: {
    width: '100%',
  },
  base: {
    minWidth: 44,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: theme.fontFamily.semibold,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
  disabled: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.input,
    shadowOpacity: 0,
    elevation: 0,
  },
  variantPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  variantSecondary: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  variantOutline: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.input,
    shadowOpacity: 0,
    elevation: 0,
  },
  variantSuccess: {
    backgroundColor: theme.colors.success.light,
    borderColor: theme.colors.success.light,
    shadowOpacity: 0,
    elevation: 0,
  },
  variantError: {
    backgroundColor: theme.colors.destructive.light,
    borderColor: theme.colors.destructive.light,
    shadowOpacity: 0,
    elevation: 0,
  },
  variantGhost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
});
