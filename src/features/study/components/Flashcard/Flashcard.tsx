import { MathText, containsRichTextMarkup } from '@/components/ui/MathText';
import useReducedMotion from '@/hooks/useReducedMotion';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import type React from 'react';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Dimensions,
  Pressable,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { flashcardStyles as styles } from './Flashcard.styles';
import type { FlashcardProps } from './Flashcard.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

const getAccessibleCardText = (content: string) =>
  content
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\[()[\]{}]/g, ' ')
    .replace(/\$+/g, ' ')
    .replace(/[_^{}]/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const Flashcard: React.FC<FlashcardProps> = ({
  flashcard,
  cardToken,
  disabled = false,
  onFlip,
  onSwipedLeft,
  onSwipedRight,
  onSwipedUp,
  style,
  testID,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    setIsFlipped(false);
    flipAnimation.value = 0;
    translateX.value = prefersReducedMotion
      ? withTiming(0, { duration: 0 })
      : withSpring(0);
    translateY.value = prefersReducedMotion
      ? withTiming(0, { duration: 0 })
      : withSpring(0);
  }, [cardToken, prefersReducedMotion]);

  useEffect(() => {
    if (!disabled) {
      return;
    }

    translateX.value = prefersReducedMotion
      ? withTiming(0, { duration: 0 })
      : withSpring(0, { damping: 15, stiffness: 200 });
    translateY.value = prefersReducedMotion
      ? withTiming(0, { duration: 0 })
      : withSpring(0, { damping: 15, stiffness: 200 });
  }, [disabled, prefersReducedMotion, translateX, translateY]);

  const usesStaticFaceSwap =
    containsRichTextMarkup(flashcard.recto) ||
    containsRichTextMarkup(flashcard.verso);

  const handlePress = () => {
    if (disabled) {
      return;
    }

    const nextIsFlipped = !isFlipped;
    triggerHaptic('impact');
    setIsFlipped(nextIsFlipped);
    onFlip?.(nextIsFlipped);

    const accessibleText = getAccessibleCardText(
      nextIsFlipped ? flashcard.verso : flashcard.recto,
    );
    void AccessibilityInfo.announceForAccessibility(
      `${nextIsFlipped ? 'Back of card' : 'Front of card'}. ${accessibleText}`,
    );

    if (usesStaticFaceSwap) {
      flipAnimation.value = nextIsFlipped ? 1 : 0;
      return;
    }

    flipAnimation.value = withTiming(nextIsFlipped ? 1 : 0, {
      duration: prefersReducedMotion ? 0 : 600,
    });
  };

  const accessibilityActions = disabled
    ? []
    : [
        {
          name: 'activate',
          label: isFlipped ? 'Flip to question' : 'Flip to answer',
        },
        {
          name: 'markForgotten',
          label: 'Mark card as forgotten',
        },
        {
          name: 'markRemembered',
          label: 'Mark card as remembered',
        },
        {
          name: 'markKnown',
          label: 'Mark card as confidently known',
        },
      ];

  const panGesture = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(18)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const isSwipedRight = event.translationX > SWIPE_THRESHOLD;
      const isSwipedLeft = event.translationX < -SWIPE_THRESHOLD;
      const isSwipedUp = event.translationY < -SWIPE_THRESHOLD;

      if (isSwipedRight && onSwipedRight) {
        translateX.value = withTiming(
          SCREEN_WIDTH * 1.5,
          { duration: prefersReducedMotion ? 0 : 300 },
          () => {
            runOnJS(onSwipedRight)();
          },
        );
      } else if (isSwipedLeft && onSwipedLeft) {
        translateX.value = withTiming(
          -SCREEN_WIDTH * 1.5,
          { duration: prefersReducedMotion ? 0 : 300 },
          () => {
            runOnJS(onSwipedLeft)();
          },
        );
      } else if (isSwipedUp && onSwipedUp) {
        translateY.value = withTiming(
          -SCREEN_WIDTH * 1.5,
          { duration: prefersReducedMotion ? 0 : 300 },
          () => {
            runOnJS(onSwipedUp)();
          },
        );
      } else {
        translateX.value = prefersReducedMotion
          ? withTiming(0, { duration: 0 })
          : withSpring(0, { damping: 15, stiffness: 200 });
        translateY.value = prefersReducedMotion
          ? withTiming(0, { duration: 0 })
          : withSpring(0, { damping: 15, stiffness: 200 });
      }
    });

  const panAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-10, 0, 10],
      Extrapolation.CLAMP,
    );
    const dragDistance = Math.max(
      Math.abs(translateX.value),
      Math.abs(translateY.value),
    );
    const scale = interpolate(
      dragDistance,
      [0, SWIPE_THRESHOLD],
      [1, 0.99],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale },
      ],
    };
  });

  const frontAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { perspective: 1200 },
        {
          rotateY: `${interpolate(flipAnimation.value, [0, 0.5, 1], [0, -90, -180])}deg`,
        },
      ],
      opacity: interpolate(flipAnimation.value, [0, 0.5, 1], [1, 0, 1]),
    }),
    [],
  );

  const backAnimatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { perspective: 1200 },
        {
          rotateY: `${interpolate(flipAnimation.value, [0, 0.5, 1], [180, 90, 0])}deg`,
        },
      ],
      opacity: interpolate(flipAnimation.value, [0, 0.5, 1], [1, 0, 1]),
    }),
    [],
  );

  const forgotOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, -SWIPE_THRESHOLD / 2],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const rememberedOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD / 2],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const knownOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, -SWIPE_THRESHOLD / 2],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const currentSideLabel = isFlipped ? 'Back of card' : 'Front of card';
  const currentCardText = getAccessibleCardText(
    isFlipped ? flashcard.verso : flashcard.recto,
  );

  const handleAccessibilityAction = ({
    nativeEvent,
  }: Parameters<
    NonNullable<React.ComponentProps<typeof Pressable>['onAccessibilityAction']>
  >[0]) => {
    if (disabled) {
      return;
    }

    switch (nativeEvent.actionName) {
      case 'activate':
        handlePress();
        break;
      case 'markForgotten':
        onSwipedLeft?.();
        break;
      case 'markRemembered':
        onSwipedRight?.();
        break;
      case 'markKnown':
        onSwipedUp?.();
        break;
      default:
        break;
    }
  };

  const renderSwipeTag = ({
    label,
    animatedStyle,
    tagStyle,
    backgroundColor,
    borderColor,
    textColor,
  }: {
    label: string;
    animatedStyle: ReturnType<typeof useAnimatedStyle>;
    tagStyle: ViewStyle;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  }) => (
    <Animated.View
      style={[
        styles.swipeTag,
        tagStyle,
        animatedStyle,
        {
          backgroundColor,
          borderColor,
        },
      ]}
    >
      <Text style={[styles.swipeTagText, { color: textColor }]}>{label}</Text>
    </Animated.View>
  );

  const renderCardFace = ({
    side,
    content,
    eyebrowLabel,
    helperLabel,
    cardStyle,
    animatedStyle,
    renderKey,
  }: {
    side: 'front' | 'back';
    content: string;
    eyebrowLabel: string;
    helperLabel: string;
    cardStyle: ViewStyle;
    animatedStyle?: ReturnType<typeof useAnimatedStyle>;
    renderKey: string;
  }) => {
    const isBack = side === 'back';

    return (
      <Animated.View
        key={renderKey}
        style={[styles.card, cardStyle, animatedStyle]}
      >
        <View style={styles.cardContent}>
          <View style={styles.faceHeader}>
            <View
              style={[styles.eyebrow, isBack ? styles.eyebrowBack : undefined]}
            >
              <Text style={styles.eyebrowText}>{eyebrowLabel}</Text>
            </View>
          </View>
          <View style={styles.textContent}>
            <MathText
              content={content}
              renderKey={renderKey}
              textColor={theme.colors.foreground}
              fontSize={theme.typography.heading1.fontSize}
              lineHeight={theme.typography.heading1.lineHeight}
              textAlign="center"
              fitMode="shrinkToFit"
              minFontScale={0.65}
              fitStepPx={2}
            />
          </View>
          <Text style={styles.faceHint}>{helperLabel}</Text>
        </View>

        {renderSwipeTag({
          label: 'Remember',
          animatedStyle: rememberedOpacity,
          tagStyle: styles.rememberTag,
          backgroundColor: theme.colors.success.light,
          borderColor: theme.colors.success.DEFAULT,
          textColor: theme.colors.success.DEFAULT,
        })}
        {renderSwipeTag({
          label: 'Forgot',
          animatedStyle: forgotOpacity,
          tagStyle: styles.forgotTag,
          backgroundColor: theme.colors.destructive.light,
          borderColor: theme.colors.destructive.DEFAULT,
          textColor: theme.colors.destructive.DEFAULT,
        })}
        {renderSwipeTag({
          label: 'Known',
          animatedStyle: knownOpacity,
          tagStyle: styles.knownTag,
          backgroundColor: theme.colors.primaryLight,
          borderColor: theme.colors.primary,
          textColor: theme.colors.primary,
        })}
      </Animated.View>
    );
  };

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.container, style]} testID={testID}>
        <View
          pointerEvents="none"
          style={[styles.stackLayer, styles.stackLayerBack]}
        />
        <View
          pointerEvents="none"
          style={[styles.stackLayer, styles.stackLayerMiddle]}
        />
        <Animated.View style={[styles.activeCardShell, panAnimatedStyle]}>
          <Pressable
            onPress={handlePress}
            disabled={disabled}
            style={styles.pressable}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${currentSideLabel}. ${currentCardText}`}
            accessibilityHint={
              disabled
                ? 'Saving your review. Wait a moment before interacting with the next card.'
                : 'Double tap to flip the card. Swipe left to forget, swipe up if you already know it, or swipe right to remember. Manual review buttons are available from the control below the card.'
            }
            accessibilityState={{ disabled }}
            accessibilityActions={accessibilityActions}
            onAccessibilityAction={handleAccessibilityAction}
          >
            {usesStaticFaceSwap
              ? renderCardFace({
                  side: isFlipped ? 'back' : 'front',
                  content: isFlipped ? flashcard.verso : flashcard.recto,
                  eyebrowLabel: isFlipped ? 'Answer' : 'Prompt',
                  helperLabel: isFlipped
                    ? 'Tap to see the prompt'
                    : 'Tap to reveal the answer',
                  cardStyle: isFlipped ? styles.backCard : styles.frontCard,
                  renderKey: `${cardToken}-${isFlipped ? 'back' : 'front'}`,
                })
              : [
                  renderCardFace({
                    side: 'front',
                    content: flashcard.recto,
                    eyebrowLabel: 'Prompt',
                    helperLabel: 'Tap to reveal the answer',
                    cardStyle: styles.frontCard,
                    animatedStyle: frontAnimatedStyle,
                    renderKey: `${cardToken}-front`,
                  }),
                  renderCardFace({
                    side: 'back',
                    content: flashcard.verso,
                    eyebrowLabel: 'Answer',
                    helperLabel: 'Tap to see the prompt',
                    cardStyle: styles.backCard,
                    animatedStyle: backAnimatedStyle,
                    renderKey: `${cardToken}-back`,
                  }),
                ]}
          </Pressable>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};
