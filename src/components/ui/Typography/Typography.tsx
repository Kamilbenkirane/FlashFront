import { theme } from '@/tokens/theme';
import type { Theme } from '@/tokens/theme';
import type React from 'react';
import { Text, type TextProps } from 'react-native';

type TypographyVariant =
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'body'
  | 'caption'
  | 'button'
  | 'small';

type TypographyColor =
  | 'default'
  | 'muted'
  | 'dim'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'accent';

export interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  children: React.ReactNode;
  className?: string;
}

function resolveTypographyColor(theme: Theme, color: TypographyColor): string {
  const c = theme.colors;
  switch (color) {
    case 'default':
      return c.foreground;
    case 'muted':
      return c.mutedForeground;
    case 'dim':
      return c.placeholder;
    case 'primary':
      return c.primary;
    case 'secondary':
      return c.secondaryForeground;
    case 'success':
      return c.success.DEFAULT;
    case 'warning':
      return c.warning.DEFAULT;
    case 'error':
      return c.destructive.DEFAULT;
    case 'accent':
      return c.accentForeground;
    default:
      return c.foreground;
  }
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'default',
  children,
  className = '',
  style,
  ...props
}) => {
  return (
    <Text
      className={className}
      style={[
        theme.typography[variant],
        { color: resolveTypographyColor(theme, color) },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
