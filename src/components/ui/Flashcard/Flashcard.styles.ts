import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

const { colors, spacing, borderRadius, typography, shadows } = theme;

export const createFlashcardStyles = (isDark: boolean) => {
  const currentColors = isDark ? theme.darkColors : colors;

  return StyleSheet.create({
    container: {
      position: 'relative',
      height: 400,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.md,
    },

    card: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: borderRadius.xl,
      ...shadows.lg,
      overflow: 'hidden',
      backfaceVisibility: 'hidden',
    },

    frontCard: {
      backgroundColor: currentColors.neutral[50],
      borderWidth: 2,
      borderColor: currentColors.primary[200],
    },

    backCard: {
      backgroundColor: currentColors.success[50],
      borderWidth: 2,
      borderColor: currentColors.success[200],
    },

    cardContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },

    cardText: {
      ...typography.heading2,
      color: currentColors.neutral[800],
      textAlign: 'center',
      marginBottom: spacing.md,
      lineHeight: typography.heading2.fontSize * 1.3,
    },

    sideLabel: {
      ...typography.caption,
      color: currentColors.neutral[500],
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontWeight: '600',
    },

    badge: {
      position: 'absolute',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      minWidth: 40,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.sm,
    },

    streakBadge: {
      top: spacing.md,
      left: spacing.md,
      backgroundColor: currentColors.success[500],
    },

    timeBadge: {
      top: spacing.md,
      right: spacing.md,
      backgroundColor: currentColors.warning[500],
    },

    scoreBadge: {
      bottom: spacing.md,
      left: spacing.md,
      backgroundColor: currentColors.primary[500],
    },

    badgeText: {
      ...typography.caption,
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 12,
    },

    flipHint: {
      position: 'absolute',
      bottom: -spacing.lg,
      left: 0,
      right: 0,
      alignItems: 'center',
    },

    flipHintText: {
      ...typography.caption,
      color: currentColors.neutral[400],
      fontSize: 12,
    },

    emptyState: {
      backgroundColor: currentColors.neutral[100],
      borderWidth: 2,
      borderColor: currentColors.neutral[300],
      borderStyle: 'dashed',
      borderRadius: borderRadius.xl,
      justifyContent: 'center',
      alignItems: 'center',
    },

    emptyStateText: {
      ...typography.body,
      color: currentColors.neutral[500],
    },
  });
};
