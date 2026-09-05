import { theme } from '@/tokens/theme';
import type React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Typography } from '../Typography';
import type { LoadingStateProps } from './LoadingState.types';

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  size = 'large',
  overlay = false,
  testID,
}) => {
  return (
    <View
      style={[styles.container, overlay && styles.overlay]}
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      accessibilityLabel={message || 'Loading'}
    >
      <ActivityIndicator
        color={theme.colors.primary}
        size={size === 'small' ? 'small' : 'large'}
      />
      {message && (
        <Typography
          variant="body"
          color="muted"
          style={styles.message}
          accessibilityLiveRegion="polite"
        >
          {message}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    backgroundColor: theme.colors.overlay,
  },
  message: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
});
