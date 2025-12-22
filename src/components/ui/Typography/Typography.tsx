import type React from 'react';
import { Text, type TextProps } from 'react-native';

export type TypographyVariant =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'body'
  | 'caption'
  | 'button'
  | 'small';

export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<TypographyVariant, string> = {
  heading1: 'text-[32px] font-bold leading-10',
  heading2: 'text-2xl font-semibold leading-8',
  heading3: 'text-xl font-semibold leading-7',
  body: 'text-base font-normal leading-6',
  caption: 'text-sm font-normal leading-5',
  button: 'text-base font-semibold leading-5',
  small: 'text-xs font-normal leading-4',
};

const colorClasses: Record<TypographyColor, string> = {
  primary: 'text-primary-500',
  secondary: 'text-primary-400',
  success: 'text-success-500',
  warning: 'text-warning-500',
  error: 'text-error-500',
  neutral: 'text-neutral-900 dark:text-neutral-100',
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'neutral',
  children,
  className = '',
  ...props
}) => {
  const combinedClassName =
    `${variantClasses[variant]} ${colorClasses[color]} ${className}`.trim();

  return (
    <Text className={combinedClassName} {...props}>
      {children}
    </Text>
  );
};
