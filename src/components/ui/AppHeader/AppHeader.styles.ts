import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

const { colors, spacing, borderRadius, shadows, typography } = theme;

export const createAppHeaderStyles = (isDark: boolean) => {
  const currentColors = isDark ? theme.darkColors : colors;

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: currentColors.surface,
      borderBottomWidth: 1,
      borderBottomColor: currentColors.border,
      ...shadows.sm,
    },

    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    centerSection: {
      flex: 2,
      alignItems: 'center',
    },

    rightSection: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: 1,
    },

    backButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: currentColors.primary[50],
      marginRight: spacing.md,
    },

    backButtonText: {
      fontSize: 18,
      color: currentColors.primary[500],
      fontWeight: '600',
    },

    title: {
      ...typography.heading2,
      color: currentColors.foreground,
      fontWeight: '700',
      textAlign: 'center',
    },

    subtitle: {
      ...typography.caption,
      color: currentColors.muted,
      textAlign: 'center',
      marginTop: 2,
    },

    brandContainer: {
      alignItems: 'center',
    },

    brandIcon: {
      fontSize: 24,
      marginBottom: 2,
    },

    // User Avatar Styles
    avatarContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.full,
      backgroundColor: currentColors.primary[100],
      borderWidth: 2,
      borderColor: currentColors.primary[200],
    },

    avatarSm: {
      width: 32,
      height: 32,
    },

    avatarMd: {
      width: 40,
      height: 40,
    },

    avatarLg: {
      width: 48,
      height: 48,
    },

    avatarText: {
      color: currentColors.primary[600],
      fontWeight: '600',
    },

    avatarTextSm: {
      fontSize: 12,
    },

    avatarTextMd: {
      fontSize: 14,
    },

    avatarTextLg: {
      fontSize: 16,
    },

    userInfo: {
      marginLeft: spacing.sm,
      flex: 1,
    },

    userName: {
      ...typography.body,
      color: currentColors.foreground,
      fontWeight: '600',
    },

    userRole: {
      ...typography.caption,
      color: currentColors.muted,
    },
  });
};
