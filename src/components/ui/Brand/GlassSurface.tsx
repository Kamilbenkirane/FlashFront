import { theme } from '@/tokens/theme';
import { BlurView } from 'expo-blur';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';

/** Glass is reserved for floating controls; content stays on opaque surfaces. */
export const GlassSurface = ({ children, style, ...props }: ViewProps) => {
  const [reduceTransparency, setReduceTransparency] = useState(true);
  useEffect(() => {
    if (Platform.OS === 'web') {
      const preference = window.matchMedia(
        '(prefers-reduced-transparency: reduce), (forced-colors: active)',
      );
      const update = () => setReduceTransparency(preference.matches);
      update();
      preference.addEventListener('change', update);
      return () => {
        preference.removeEventListener('change', update);
      };
    }
    if (Platform.OS !== 'ios') return;
    let mounted = true;
    void AccessibilityInfo.isReduceTransparencyEnabled().then((enabled) => {
      if (mounted) setReduceTransparency(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparency,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);
  return (
    <View
      {...props}
      style={[
        styles.surface,
        style,
        !reduceTransparency && { backgroundColor: 'rgba(10, 42, 59, 0.72)' },
      ]}
    >
      {!reduceTransparency ? (
        <BlurView
          tint="dark"
          intensity={80}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  surface: {
    backgroundColor: theme.colors.navy,
    borderWidth: 1,
    borderColor: '#658594',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
});
