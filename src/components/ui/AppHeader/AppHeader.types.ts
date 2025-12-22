import type { TextStyle, ViewStyle } from 'react-native';

export interface AppHeaderProps {
  title?: string;
  showUserAvatar?: boolean;
  userName?: string;
  userInitials?: string;
  onUserPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightActions?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  testID?: string;
}

export interface UserAvatarProps {
  name?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
  testID?: string;
}
