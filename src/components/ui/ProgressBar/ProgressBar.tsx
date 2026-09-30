import useReducedMotion from '@/hooks/useReducedMotion';
import { theme } from '@/tokens/theme';
import React from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Typography } from '../Typography';
import type { ProgressBarProps, ProgressBarSize } from './ProgressBar.types';

const sizeConfig: Record<ProgressBarSize, { height: number; radius: number }> =
  {
    sm: { height: 4, radius: 4 },
    md: { height: 6, radius: 6 },
    lg: { height: 8, radius: 8 },
  };

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  total,
  showLabel = true,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  testID,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const animatedProgress = useSharedValue(0);

  // Animate progress changes
  React.useEffect(() => {
    const percentage = total > 0 ? (progress / total) * 100 : 0;
    animatedProgress.value = withTiming(percentage, {
      duration: prefersReducedMotion ? 0 : 500,
    });
  }, [prefersReducedMotion, progress, total]);

  const animatedStyle = useAnimatedStyle(
    () => ({
      width: `${Math.min(100, Math.max(0, animatedProgress.value))}%`,
    }),
    [],
  );

  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
  const fillColors = {
    primary: theme.colors.primary,
    success: theme.colors.success.DEFAULT,
    warning: theme.colors.warning.DEFAULT,
    error: theme.colors.destructive.DEFAULT,
  };
  const trackStyle = {
    height: sizeConfig[size].height,
    borderRadius: sizeConfig[size].radius,
    backgroundColor: theme.colors.secondary,
    overflow: 'hidden' as const,
  };

  return (
    <View
      style={{ width: '100%' }}
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: progress }}
      accessibilityLabel={`Progress ${progress} of ${total}`}
    >
      {showLabel && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
          }}
        >
          <Typography variant="caption" color="muted">
            {`${progress} / ${total}`}
          </Typography>
          {showPercentage && (
            <Typography
              variant="caption"
              color="muted"
              style={{ fontWeight: '600' }}
            >
              {`${percentage}%`}
            </Typography>
          )}
        </View>
      )}

      <View style={trackStyle}>
        <Animated.View
          style={[
            animatedStyle,
            {
              height: '100%',
              borderRadius: sizeConfig[size].radius,
              backgroundColor: fillColors[color],
            },
          ]}
        />
      </View>
    </View>
  );
};
