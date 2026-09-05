import type { BottomTabBarProps as NavigationBottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { ViewStyle } from 'react-native';

export interface TabBarProps extends NavigationBottomTabBarProps {
  style?: ViewStyle;
  testID?: string;
}

export interface TabItemProps {
  route: NavigationBottomTabBarProps['state']['routes'][number];
  descriptor: NavigationBottomTabBarProps['descriptors'][string];
  navigation: NavigationBottomTabBarProps['navigation'];
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  testID?: string;
}
