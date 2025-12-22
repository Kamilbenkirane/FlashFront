import React from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Typography } from '../Typography';
import type {
  ProgressBarColor,
  ProgressBarProps,
  ProgressBarSize,
} from './ProgressBar.types';

const sizeClasses: Record<ProgressBarSize, { track: string; fill: string }> = {
  sm: { track: 'h-1 rounded-sm', fill: 'rounded-sm' },
  md: { track: 'h-2 rounded', fill: 'rounded' },
  lg: { track: 'h-3 rounded-md', fill: 'rounded-md' },
};

const colorClasses: Record<ProgressBarColor, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  error: 'bg-error-500',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  showLabel = true,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  className = '',
  testID,
}) => {
  const animatedProgress = useSharedValue(0);

  // Animate progress changes
  React.useEffect(() => {
    const percentage = total > 0 ? (progress / total) * 100 : 0;
    animatedProgress.value = withTiming(percentage, { duration: 500 });
  }, [progress, total]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      width: `${Math.min(100, Math.max(0, animatedProgress.value))}%`,
    }),
    [],
  );

  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <View className={`w-full ${className}`} testID={testID}>
      {showLabel && (
        <View className="flex-row justify-between items-center mb-1">
          <Typography
            variant="caption"
            className="text-neutral-600 dark:text-neutral-400"
          >
            {`${progress} / ${total}`}
          </Typography>
          {showPercentage && (
            <Typography
              variant="caption"
              className="text-neutral-600 dark:text-neutral-400 font-semibold"
            >
              {`${percentage}%`}
            </Typography>
          )}
        </View>
      )}

      <View
        className={`w-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden ${sizeClasses[size].track}`}
      >
        <Animated.View
          className={`h-full ${colorClasses[color]} ${sizeClasses[size].fill}`}
          style={animatedStyle}
        />
      </View>
    </View>
  );
};
