import { MathText } from '@/components/ui/MathText';
import useReducedMotion from '@/hooks/useReducedMotion';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import type React from 'react';
import { useEffect } from 'react';
import {
  AccessibilityInfo,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { flashcardStyles as styles } from './Flashcard.styles';
import type { FlashcardProps } from './Flashcard.types';

const accessibleCardText = (content: string) =>
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
  revealed = false,
  disabled = false,
  onFlip,
  onSwipedLeft,
  onSwipedRight,
  style,
  testID,
}) => {
  const reducedMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const swipeThreshold = Math.min(width, 540) * 0.28;
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const leaving = useSharedValue(false);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    leaving.value = false;
  }, [cardToken, leaving, translateX, translateY]);

  useEffect(() => {
    if (revealed) {
      triggerHaptic('selection');
      AccessibilityInfo.announceForAccessibility(
        `Answer. ${accessibleCardText(flashcard.verso)}`,
      );
    }
    opacity.value = reducedMotion ? 1 : 0.35;
    opacity.value = withTiming(1, { duration: reducedMotion ? 0 : 160 });
  }, [revealed, cardToken, reducedMotion, opacity, flashcard.verso]);

  const flip = () => {
    if (disabled) return;
    if (revealed) triggerHaptic('selection');
    onFlip?.(!revealed);
  };

  const gesture = Gesture.Pan()
    .enabled(!disabled && revealed)
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onUpdate((event) => {
      if (leaving.value || reducedMotion) return;
      translateX.value = event.translationX;
      translateY.value = Math.min(event.translationY, 0);
    })
    .onEnd((event) => {
      if (leaving.value) return;
      const action =
        event.translationX > swipeThreshold
          ? onSwipedRight
          : event.translationX < -swipeThreshold
            ? onSwipedLeft
            : undefined;
      if (action) {
        leaving.value = true;
        if (reducedMotion) {
          runOnJS(action)();
          return;
        }
        const target = Math.sign(event.translationX) * width;
        translateY.value = withTiming(0, { duration: 180 });
        translateX.value = withTiming(target, { duration: 180 }, (finished) => {
          if (finished) runOnJS(action)();
        });
      } else {
        translateX.value = withSpring(0, { damping: 24, stiffness: 250 });
        translateY.value = withSpring(0, { damping: 24, stiffness: 250 });
      }
    });
  const motionStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${reducedMotion ? 0 : translateX.value / 35}deg` },
    ],
  }));
  const currentText = revealed ? flashcard.verso : flashcard.recto;

  return (
    <GestureDetector gesture={gesture}>
      <View style={[styles.container, style]} testID={testID}>
        <View pointerEvents="none" style={styles.cardEdge} />
        <Animated.View style={[styles.activeCardShell, motionStyle]}>
          <Pressable
            onPress={flip}
            disabled={disabled}
            style={[styles.card, revealed && styles.backCard]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`${revealed ? 'Answer' : 'Question'}. ${accessibleCardText(currentText)}`}
            accessibilityHint={
              disabled
                ? 'Saving your review.'
                : revealed
                  ? 'Tap to see the question again. Review buttons follow the card.'
                  : 'Try to recall, then double tap to reveal the answer.'
            }
            accessibilityState={{ disabled }}
          >
            <Text style={styles.faceLabel}>
              {revealed ? 'Answer' : 'Question'}
            </Text>
            <View style={styles.textContent}>
              <MathText
                content={currentText}
                renderKey={`${cardToken}-${revealed ? 'answer' : 'question'}`}
                textColor={theme.colors.foregroundInvert}
                fontSize={28}
                lineHeight={38}
                textAlign="center"
                layoutMode="auto"
                fillContainer={false}
              />
            </View>
          </Pressable>
        </Animated.View>
      </View>
    </GestureDetector>
  );
};
