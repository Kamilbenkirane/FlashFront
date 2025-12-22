import type React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Typography } from '../Typography';
import type { LoadingStateProps } from './LoadingState.types';

const baseClasses = 'flex items-center justify-center p-8';
const overlayClasses = 'absolute inset-0 z-[1000] bg-white/90 dark:bg-black/70';

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'large',
  overlay = false,
  className = '',
  testID,
}) => {
  const containerClassName =
    `${baseClasses} ${overlay ? overlayClasses : ''} ${className}`.trim();

  // Use primary color for spinner
  const spinnerColor = '#3b82f6'; // primary-500

  return (
    <View className={containerClassName} testID={testID}>
      <ActivityIndicator size={size} color={spinnerColor} className="mb-4" />
      {message && (
        <Typography variant="body" color="neutral" className="text-center mt-2">
          {message}
        </Typography>
      )}
    </View>
  );
};
