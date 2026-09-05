import { theme } from '@/tokens/theme';
import type React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

type CardVariant = 'default' | 'raised' | 'muted' | 'outline';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  style,
  ...props
}) => {
  const paddingStyles = {
    none: styles.paddingNone,
    sm: styles.paddingSm,
    md: styles.paddingMd,
    lg: styles.paddingLg,
  };

  const variantStyles = {
    default: styles.variantDefault,
    raised: styles.variantRaised,
    muted: styles.variantMuted,
    outline: styles.variantOutline,
  };

  return (
    <View
      className={className}
      style={[
        styles.base,
        variantStyles[variant],
        paddingStyles[padding],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: theme.spacing.sm,
  },
  paddingMd: {
    padding: theme.spacing.lg,
  },
  paddingLg: {
    padding: theme.spacing.xl,
  },
  variantDefault: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  variantRaised: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  variantMuted: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  variantOutline: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
});
