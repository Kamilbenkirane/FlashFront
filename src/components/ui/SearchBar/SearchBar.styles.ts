import { StyleSheet } from 'react-native';

export const createSearchBarStyles = (isDark: boolean) => {
  const colors = {
    background: isDark ? '#2a2a2a' : '#f5f5f5',
    text: isDark ? '#ffffff' : '#000000',
    muted: isDark ? '#888888' : '#666666',
    border: isDark ? '#444444' : '#e0e0e0',
  };

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 12,
    },
    iconText: {
      fontSize: 16,
      color: colors.muted,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      paddingVertical: 0,
    },
    clearButton: {
      marginLeft: 12,
      padding: 4,
      borderRadius: 12,
      backgroundColor: colors.border,
    },
    clearIcon: {
      fontSize: 14,
      color: colors.muted,
      fontWeight: 'bold',
    },
  });
};
