import type React from 'react';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../../context/ThemeContext';
import type { SessionData } from '../../../interfaces';
import { triggerHaptic } from '../../../utils/haptics';
import { createFlashcardStyles } from './Flashcard.styles';

export interface FlashcardProps {
  flashcard: SessionData;
  onFlip?: (isFlipped: boolean) => void;
  style?: ViewStyle;
  testID?: string;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  flashcard,
  onFlip,
  style,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createFlashcardStyles(isDark);

  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useSharedValue(0);

  // Reset flip state when flashcard changes
  useEffect(() => {
    setIsFlipped(false);
    flipAnimation.value = 0;
  }, [flashcard]);

  const handlePress = () => {
    // Add haptic feedback only on mobile platforms
    triggerHaptic('impact');

    // Toggle flip state
    setIsFlipped(!isFlipped);

    // Animate flip
    flipAnimation.value = withTiming(
      isFlipped ? 0 : 1,
      {
        duration: 600,
      },
      () => {
        // Call onFlip callback when animation completes
        if (onFlip) {
          runOnJS(onFlip)(!isFlipped);
        }
      },
    );
  };

  // Animated styles for front side
  const frontAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          rotateY: `${interpolate(flipAnimation.value, [0, 0.5, 1], [0, -90, -180])}deg`,
        },
      ],
      opacity: interpolate(flipAnimation.value, [0, 0.5, 1], [1, 0, 1]),
    }),
    [],
  );

  // Animated styles for back side
  const backAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        {
          rotateY: `${interpolate(flipAnimation.value, [0, 0.5, 1], [180, 90, 0])}deg`,
        },
      ],
      opacity: interpolate(flipAnimation.value, [0, 0.5, 1], [1, 0, 1]),
    }),
    [],
  );

  const formatTimeSinceLastReview = (seconds?: number) => {
    if (seconds === undefined) return 'No Review';
    if (seconds < 60) {
      return `${seconds}s`;
    }
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
    }
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d${hours > 0 ? ` ${hours}h` : ''}`;
  };

  const formatPopupScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  if (!flashcard) {
    return (
      <View style={[styles.container, styles.emptyState, style]}>
        <Text style={styles.emptyStateText}>No flashcard available</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, style]}
      testID={testID}
    >
      {/* Front Side */}
      <Animated.View
        style={[styles.card, styles.frontCard, frontAnimatedStyle]}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardText}>{flashcard.recto}</Text>
          <Text style={styles.sideLabel}>Front</Text>
        </View>

        {/* Statistics Badges */}
        <View style={[styles.badge, styles.streakBadge]}>
          <Text style={styles.badgeText}>{flashcard.streak}</Text>
        </View>

        <View style={[styles.badge, styles.timeBadge]}>
          <Text style={styles.badgeText}>
            {formatTimeSinceLastReview(flashcard.secondsSinceLastReview)}
          </Text>
        </View>

        <View style={[styles.badge, styles.scoreBadge]}>
          <Text style={styles.badgeText}>
            {formatPopupScore(flashcard.popupScore)}
          </Text>
        </View>
      </Animated.View>

      {/* Back Side */}
      <Animated.View style={[styles.card, styles.backCard, backAnimatedStyle]}>
        <View style={styles.cardContent}>
          <Text style={styles.cardText}>{flashcard.verso}</Text>
          <Text style={styles.sideLabel}>Back</Text>
        </View>

        {/* Statistics Badges */}
        <View style={[styles.badge, styles.streakBadge]}>
          <Text style={styles.badgeText}>{flashcard.streak}</Text>
        </View>

        <View style={[styles.badge, styles.timeBadge]}>
          <Text style={styles.badgeText}>
            {formatTimeSinceLastReview(flashcard.secondsSinceLastReview)}
          </Text>
        </View>

        <View style={[styles.badge, styles.scoreBadge]}>
          <Text style={styles.badgeText}>
            {formatPopupScore(flashcard.popupScore)}
          </Text>
        </View>
      </Animated.View>

      {/* Flip Hint */}
      <View style={styles.flipHint}>
        <Text style={styles.flipHintText}>
          {Platform.OS === 'web' ? 'Click to flip' : 'Tap to flip'}
        </Text>
      </View>
    </Pressable>
  );
};
