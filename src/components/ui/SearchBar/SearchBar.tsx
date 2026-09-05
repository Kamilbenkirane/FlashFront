import { AppIcon } from '@/components/ui/icons';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import type React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { searchBarStyles as styles } from './SearchBar.styles';
import type { SearchBarProps } from './SearchBar.types';

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search...',
  style,
  testID,
  accessibilityLabel,
}) => {
  const handleClear = () => {
    triggerHaptic('impact');
    onClear();
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Search Icon */}
      <View style={styles.searchIcon}>
        <AppIcon
          color={theme.colors.placeholder}
          name="search"
          size={20}
          strokeWidth={2.15}
        />
      </View>

      {/* Text Input */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.placeholder}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel || placeholder}
        accessibilityHint="Search by keyword"
        testID={`${testID}-input`}
      />

      {/* Clear Button */}
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          accessibilityHint="Clears the current search text"
          hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
        >
          <AppIcon
            color={theme.colors.mutedForeground}
            name="closeCircle"
            size={18}
          />
        </Pressable>
      )}
    </View>
  );
};
