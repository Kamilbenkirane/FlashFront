import type React from 'react';
import { View, type ViewProps } from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'outlined';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: CardPadding;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-neutral-50 dark:bg-neutral-800 shadow-sm rounded-xl',
  elevated: 'bg-neutral-50 dark:bg-neutral-800 shadow-md rounded-xl',
  outlined:
    'bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl',
};

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  ...props
}) => {
  const combinedClassName =
    `${variantClasses[variant]} ${paddingClasses[padding]} ${className}`.trim();

  return (
    <View className={combinedClassName} {...props}>
      {children}
    </View>
  );
};
