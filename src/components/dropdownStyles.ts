import { StyleSheet } from 'react-native';
import type { Theme } from '../theme';

/**
 * The chrome shared by UsersDropdown and DecksMultiSelect — the collapsed
 * button plus the expanded list. Each component adds its own extras (selection
 * highlighting, back button) on top.
 */
export const createDropdownStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginTop: theme.spacing.sm,
    },
    button: {
      backgroundColor: theme.colors.primary[500],
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.sm,
    },
    list: {
      maxHeight: 200,
      backgroundColor: theme.colors.neutral[50],
      borderColor: theme.colors.neutral[200],
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.xs,
      ...theme.shadows.md,
    },
    item: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[200],
      backgroundColor: theme.colors.neutral[50],
    },
    itemLast: {
      borderBottomWidth: 0,
    },
  });
