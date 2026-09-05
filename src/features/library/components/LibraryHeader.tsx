import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { StyleSheet, View } from 'react-native';

interface LibraryHeaderProps {
  accountLabel: string;
}

export const LibraryHeader: React.FC<LibraryHeaderProps> = ({
  accountLabel,
}) => {
  return (
    <View style={styles.header}>
      <Typography variant="heading2" style={styles.headerTitle}>
        Deck Library
      </Typography>

      <Card variant="raised">
        <Typography variant="caption" color="muted" style={styles.sectionLabel}>
          Signed in as
        </Typography>
        <Typography variant="body">{accountLabel}</Typography>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    textAlign: 'left',
    marginBottom: theme.spacing.md,
    color: theme.colors.foreground,
  },
  sectionLabel: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.muted,
    fontFamily: theme.fontFamily.medium,
  },
});
