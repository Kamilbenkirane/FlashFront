import type { StyleProp, ViewStyle } from 'react-native';

export type MathTextLayoutMode = 'fill' | 'auto';

export interface MathTextProps {
  content: string;
  textColor: string;
  fontSize: number;
  lineHeight: number;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center';
  fillContainer?: boolean;
  layoutMode?: MathTextLayoutMode;
  disablePointerEvents?: boolean;
  hideFromAccessibility?: boolean;
  style?: StyleProp<ViewStyle>;
  renderKey?: string;
}
