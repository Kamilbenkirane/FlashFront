import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { StyleSheet, View } from 'react-native';

export const LibraryHeader: React.FC = () => (
  <View style={styles.header}>
    <View style={styles.eyebrowRow}>
      <AppIcon name="sparkles" size={15} color={theme.colors.primary} />
      <Typography variant="small" color="primary" style={styles.eyebrow}>
        THE COLLECTION
      </Typography>
    </View>
    <Typography variant="heading1" style={styles.title}>
      A world to learn.
    </Typography>
    <Typography variant="body" color="muted">
      Find a new fascination. Make it yours.
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  header: {
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  eyebrow: {
    letterSpacing: 2.2,
    fontFamily: theme.fontFamily.medium,
  },
  title: {
    fontSize: 36,
    lineHeight: 43,
    letterSpacing: -1.4,
  },
});
