import type React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { createAppHeaderStyles } from './AppHeader.styles';
import type { AppHeaderProps, UserAvatarProps } from './AppHeader.types';

// User Avatar Component
const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  initials,
  size = 'md',
  onPress,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createAppHeaderStyles(isDark);

  const getInitials = (): string => {
    if (initials) return initials.toUpperCase();
    if (name) {
      return name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'U';
  };

  const avatarStyle = [
    styles.avatarContainer,
    styles[`avatar${size.charAt(0).toUpperCase() + size.slice(1)}`],
  ];

  const textStyle = [
    styles.avatarText,
    styles[`avatarText${size.charAt(0).toUpperCase() + size.slice(1)}`],
  ];

  return (
    <Pressable style={avatarStyle} onPress={onPress} testID={testID}>
      <Text style={textStyle}>{getInitials()}</Text>
    </Pressable>
  );
};

// Main AppHeader Component
export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'FlashFront',
  showUserAvatar = false,
  userName,
  userInitials,
  onUserPress,
  showBackButton = false,
  onBackPress,
  rightActions,
  style,
  titleStyle,
  testID,
}) => {
  const { theme, isDark } = useTheme();
  const styles = createAppHeaderStyles(isDark);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.container, { paddingTop: insets.top + 8 }, style]}
      testID={testID}
    >
      {/* Left Section */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <Pressable
            style={styles.backButton}
            onPress={onBackPress}
            testID="header-back-button"
          >
            <Text style={styles.backButtonText}>←</Text>
          </Pressable>
        )}

        {showUserAvatar && (
          <>
            <UserAvatar
              name={userName}
              initials={userInitials}
              size="md"
              onPress={onUserPress}
              testID="header-user-avatar"
            />
            {userName && (
              <View style={styles.userInfo}>
                <Text style={styles.userName} numberOfLines={1}>
                  {userName}
                </Text>
                <Text style={styles.userRole}>Student</Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* Center Section - Brand */}
      <View style={styles.centerSection}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandIcon}>🎯</Text>
          <Text style={[styles.title, titleStyle]}>{title}</Text>
          <Text style={styles.subtitle}>Learn Smarter</Text>
        </View>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>{rightActions}</View>
    </View>
  );
};
