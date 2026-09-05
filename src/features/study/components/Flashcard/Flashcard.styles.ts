import { theme } from '@/tokens/theme';
import { StyleSheet } from 'react-native';

const { borderRadius, colors, shadows, spacing, typography } = theme;

export const flashcardStyles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 396,
  },
  activeCardShell: {
    flex: 1,
  },
  pressable: {
    flex: 1,
    width: '100%',
  },
  stackLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  stackLayerBack: {
    backgroundColor: colors.secondary,
    opacity: 0.9,
    transform: [{ scale: 0.94 }, { translateY: 18 }],
  },
  stackLayerMiddle: {
    backgroundColor: colors.card,
    opacity: 0.98,
    transform: [{ scale: 0.97 }, { translateY: 10 }],
    ...shadows.sm,
  },
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: borderRadius.xxl,
    ...shadows.md,
    overflow: 'hidden',
    backfaceVisibility: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  frontCard: {
    backgroundColor: colors.card,
  },
  backCard: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'stretch',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.xxl,
  },
  faceHeader: {
    alignItems: 'center',
  },
  eyebrow: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.secondary,
    alignSelf: 'center',
  },
  eyebrowBack: {
    backgroundColor: colors.background,
    borderColor: colors.primary,
  },
  eyebrowText: {
    ...typography.small,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: theme.fontFamily.semibold,
  },
  textContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  faceHint: {
    ...typography.small,
    color: colors.mutedForeground,
    fontFamily: theme.fontFamily.medium,
    textAlign: 'center',
  },
  swipeTag: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  forgotTag: {
    top: spacing.lg,
    left: spacing.lg,
  },
  rememberTag: {
    top: spacing.lg,
    right: spacing.lg,
  },
  knownTag: {
    bottom: spacing.lg,
    alignSelf: 'center',
  },
  swipeTagText: {
    ...typography.small,
    fontFamily: theme.fontFamily.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  emptyState: {
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.xxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    ...typography.body,
    color: colors.mutedForeground,
  },
});
