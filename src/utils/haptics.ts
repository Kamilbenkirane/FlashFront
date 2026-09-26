import * as ExpoHaptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = (
  type: 'impact' | 'selection' | 'success' | 'error' = 'impact',
) => {
  if (Platform.OS !== 'web') {
    try {
      switch (type) {
        case 'impact':
          ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
          break;
        case 'selection':
          ExpoHaptics.selectionAsync();
          break;
        case 'success':
          ExpoHaptics.notificationAsync(
            ExpoHaptics.NotificationFeedbackType.Success,
          );
          break;
        case 'error':
          ExpoHaptics.notificationAsync(
            ExpoHaptics.NotificationFeedbackType.Error,
          );
          break;
        default:
          ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }
};
