import * as ExpoHaptics from 'expo-haptics';
import { Platform } from 'react-native';

export const triggerHaptic = (type: 'impact' | 'selection' = 'impact') => {
  if (Platform.OS !== 'web') {
    try {
      switch (type) {
        case 'impact':
          ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
          break;
        case 'selection':
          ExpoHaptics.selectionAsync();
          break;
        default:
          ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }
};
