import type React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Text, TouchableOpacity, View } from 'react-native';
import { triggerHaptic } from '../../../utils/haptics';
import { Button } from '../Button';
import { Typography } from '../Typography';

export interface AchievementModalProps {
  visible: boolean;
  title: string;
  description: string;
  icon: string;
  onClose: () => void;
  onShare?: () => void;
}

export const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  title,
  description,
  icon,
  onClose,
  onShare,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const badgeScaleAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      triggerHaptic('impact');

      // Show modal with scale animation
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Badge entrance animation
        Animated.spring(badgeScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }).start();

        // Sparkle animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      });
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      badgeScaleAnim.setValue(0);
      sparkleAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    triggerHaptic('selection');
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleShare = () => {
    if (onShare) {
      triggerHaptic('impact');
      onShare();
    }
  };

  const sparkles = ['✨', '⭐', '💫', '🌟'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/80 justify-center items-center"
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-8 mx-6 items-center max-w-[80%] shadow-lg"
          style={{
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <TouchableOpacity activeOpacity={1}>
            <View className="items-center mb-6">
              <Animated.View
                className="absolute w-[140px] h-[140px] rounded-full items-center justify-center"
                style={{ opacity: sparkleAnim }}
              >
                <Text className="absolute top-[10px] left-[10px] text-xl">
                  {sparkles[0]}
                </Text>
                <Text className="absolute top-[10px] right-[10px] text-xl">
                  {sparkles[1]}
                </Text>
                <Text className="absolute bottom-[10px] left-[10px] text-xl">
                  {sparkles[2]}
                </Text>
                <Text className="absolute bottom-[10px] right-[10px] text-xl">
                  {sparkles[3]}
                </Text>
              </Animated.View>

              <Animated.View
                className="w-[120px] h-[120px] rounded-full bg-success-500 items-center justify-center mb-4 shadow-md"
                style={{ transform: [{ scale: badgeScaleAnim }] }}
              >
                <Text className="text-6xl">{icon}</Text>
              </Animated.View>

              <Typography
                variant="heading2"
                className="text-center mb-2"
                color="primary"
              >
                Achievement Unlocked!
              </Typography>
            </View>

            <Typography variant="heading3" className="text-center mb-2">
              {title}
            </Typography>

            <Typography
              variant="body"
              className="text-center mb-8"
              color="secondary"
            >
              {description}
            </Typography>

            <View className="flex-row gap-4">
              {onShare && (
                <Button
                  title="Share"
                  onPress={handleShare}
                  variant="secondary"
                  className="flex-1"
                />
              )}
              <Button
                title="Continue"
                onPress={handleClose}
                variant="primary"
                className="flex-1"
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};
