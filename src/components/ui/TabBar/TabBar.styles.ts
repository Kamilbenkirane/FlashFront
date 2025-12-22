import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

const { colors, spacing, borderRadius, shadows, typography } = theme;

export const createTabBarStyles = (isDark: boolean) => {
  const currentColors = isDark ? theme.darkColors : colors;

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: currentColors.surface,
      borderTopWidth: 1,
      borderTopColor: currentColors.border,
      paddingBottom: spacing.sm,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.md,
      ...shadows.lg,
    },

    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: borderRadius.md,
      minHeight: 60,
      position: 'relative',
    },

    activeTabItem: {
      backgroundColor: currentColors.primary[50],
    },

    tabIconContainer: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },

    tabIcon: {
      fontSize: 24,
    },

    activeTabIcon: {
      color: currentColors.primary[500],
    },

    inactiveTabIcon: {
      color: currentColors.muted,
    },

    tabLabel: {
      ...typography.caption,
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
    },

    activeTabLabel: {
      color: currentColors.primary[500],
      fontWeight: '600',
    },

    inactiveTabLabel: {
      color: currentColors.muted,
    },

    activeBadge: {
      position: 'absolute',
      top: 4,
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: currentColors.primary[500],
    },

    floatingActionButton: {
      position: 'absolute',
      top: -25,
      alignSelf: 'center',
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: currentColors.primary[500],
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.lg,
      borderWidth: 3,
      borderColor: currentColors.surface,
    },

    fabIcon: {
      fontSize: 24,
      color: '#ffffff',
      fontWeight: 'bold',
    },

    // Animated indicator
    indicator: {
      position: 'absolute',
      bottom: 0,
      height: 3,
      backgroundColor: currentColors.primary[500],
      borderRadius: 2,
    },
  });
};

// Helper to get tab icons
export const getTabIcon = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    study: '🎯',
    library: '📚',
    profile: '👤',
    flashcard: '🎯', // Alternative name mapping
  };

  return iconMap[iconName.toLowerCase()] || '📱';
};
