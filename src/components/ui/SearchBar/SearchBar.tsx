import type React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { triggerHaptic } from '../../../utils/haptics';
import { Typography } from '../Typography';
import { createSearchBarStyles } from './SearchBar.styles';
import type { SearchBarProps } from './SearchBar.types';

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  style,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createSearchBarStyles(isDark);

  const handleClear = () => {
    triggerHaptic('impact');
    onClear();
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Search Icon */}
      <View style={styles.searchIcon}>
        <Typography variant="body" style={styles.iconText}>
          🔍
        </Typography>
      </View>

      {/* Text Input */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={styles.iconText.color}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        testID={`${testID}-input`}
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <Pressable onPress={handleClear} style={styles.clearButton}>
          <Typography variant="body" style={styles.clearIcon}>
            ✕
          </Typography>
        </Pressable>
      )}
    </View>
  );
};
