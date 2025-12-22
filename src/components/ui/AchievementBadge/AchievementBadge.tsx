import type React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { triggerHaptic } from '../../../utils/haptics';
import { Typography } from '../Typography';

export type AchievementStatus = 'locked' | 'in_progress' | 'completed';

export interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: string;
  status: AchievementStatus;
  progress?: number;
  maxProgress?: number;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  unlockAnimation?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  status,
  progress = 0,
  maxProgress = 1,
  size = 'md',
  onPress,
  unlockAnimation = false,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(
    new Animated.Value(status === 'completed' ? 1 : 0.6),
  ).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (unlockAnimation && status === 'completed') {
      // Unlock animation sequence
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Glow effect for completed achievements
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [unlockAnimation, status]);

  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: status === 'completed' ? 1 : 0.6,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [status]);

  const getSizeStyles = () => {
    const sizes = {
      sm: {
        container: 60,
        icon: 24,
        padding: theme.spacing.sm,
      },
      md: {
        container: 80,
        icon: 32,
        padding: theme.spacing.md,
      },
      lg: {
        container: 100,
        icon: 40,
        padding: theme.spacing.lg,
      },
    };
    return sizes[size];
  };

  const sizeStyles = getSizeStyles();

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return theme.colors.success[500];
      case 'in_progress':
        return theme.colors.primary[500];
      default:
        return theme.colors.neutral[300];
    }
  };

  const progressPercent = maxProgress > 0 ? (progress / maxProgress) * 100 : 0;

  const handlePress = () => {
    if (onPress) {
      triggerHaptic('selection');
      onPress();
    }
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      margin: theme.spacing.sm,
    },
    badge: {
      width: sizeStyles.container,
      height: sizeStyles.container,
      borderRadius: sizeStyles.container / 2,
      backgroundColor: getStatusColor(),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.xs,
      ...theme.shadows.md,
    },
    glowEffect: {
      position: 'absolute',
      width: sizeStyles.container + 8,
      height: sizeStyles.container + 8,
      borderRadius: (sizeStyles.container + 8) / 2,
      backgroundColor: getStatusColor(),
      opacity: 0.3,
    },
    icon: {
      fontSize: sizeStyles.icon,
    },
    textContainer: {
      alignItems: 'center',
      maxWidth: sizeStyles.container + 20,
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    description: {
      textAlign: 'center',
      fontSize: 10,
      lineHeight: 12,
    },
    progressContainer: {
      width: sizeStyles.container,
      height: 4,
      backgroundColor: theme.colors.neutral[200],
      borderRadius: 2,
      marginTop: theme.spacing.xs,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: getStatusColor(),
      borderRadius: 2,
    },
    progressText: {
      fontSize: 8,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.badge,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {status === 'completed' && (
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowAnim,
              },
            ]}
          />
        )}
        <Typography style={styles.icon}>{icon}</Typography>
      </Animated.View>

      <View style={styles.textContainer}>
        <Typography
          variant="caption"
          style={styles.title}
          color={status === 'completed' ? 'primary' : 'neutral'}
        >
          {title}
        </Typography>

        {size !== 'sm' && (
          <Typography
            variant="small"
            style={styles.description}
            color="secondary"
          >
            {description}
          </Typography>
        )}

        {status === 'in_progress' && maxProgress > 1 && (
          <>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.min(progressPercent, 100)}%` },
                ]}
              />
            </View>
            <Typography
              variant="small"
              style={styles.progressText}
              color="secondary"
            >
              {progress}/{maxProgress}
            </Typography>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};
