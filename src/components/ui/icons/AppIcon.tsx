import type { LucideProps } from 'lucide-react-native';
import type React from 'react';
import { type AppIconName, iconRegistry } from './registry';

export interface AppIconProps extends Omit<LucideProps, 'ref'> {
  name: AppIconName;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 24,
  strokeWidth = 2.1,
  absoluteStrokeWidth = true,
  ...props
}) => {
  const Icon = iconRegistry[name];

  return (
    <Icon
      absoluteStrokeWidth={absoluteStrokeWidth}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
};
