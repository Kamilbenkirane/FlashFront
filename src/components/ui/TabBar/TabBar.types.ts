import type {
  NavigationHelpers,
  NavigationState,
  ParamListBase,
} from '@react-navigation/native';
import type { ViewStyle } from 'react-native';

export interface TabBarProps {
  state: NavigationState;
  descriptors: Record<string, any>; // React Navigation descriptors are complex
  navigation: NavigationHelpers<ParamListBase>;
  style?: ViewStyle;
  testID?: string;
}

export interface TabItemProps {
  route: NavigationState['routes'][0];
  descriptor: any; // React Navigation descriptor type is very complex
  navigation: NavigationHelpers<ParamListBase>;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  testID?: string;
}

export type TabIcon = 'study' | 'library' | 'profile';

export interface TabConfig {
  name: string;
  icon: TabIcon;
  label: string;
  activeColor?: string;
  inactiveColor?: string;
}
