import type { AppIconName } from '@/components/ui/icons';
import { theme } from '@/tokens/theme';
import { StyleSheet } from 'react-native';

const { colors, spacing, borderRadius, shadows, typography } = theme;

export const tabBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 20,
  },

  dock: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },

  shell: {
    width: '100%',
    maxWidth: 396,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.72)',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    ...shadows.md,
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    elevation: 6,
  },

  shellTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 250, 252, 0.62)',
  },

  tabItemContainer: {
    flex: 1,
  },

  tabItem: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.sm - 1,
    paddingHorizontal: spacing.sm - 1,
    borderRadius: borderRadius.full,
    minHeight: 48,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  activeTabItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.84)',
    borderColor: 'rgba(255, 255, 255, 0.92)',
    ...shadows.sm,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    elevation: 1,
  },

  inactiveTabItem: {
    backgroundColor: 'transparent',
  },

  tabIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 12,
  },

  activeTabLabel: {
    color: colors.primary,
    fontWeight: '600',
  },

  inactiveTabLabel: {
    color: colors.mutedForeground,
  },

  activeIndicator: {
    width: 14,
    height: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
});

export const getTabIcon = (iconName: string): AppIconName => {
  const iconMap: Record<string, AppIconName> = {
    study: 'layers',
    library: 'library',
    profile: 'person',
    flashcard: 'layers',
  };

  return iconMap[iconName.toLowerCase()] || 'layers';
};
