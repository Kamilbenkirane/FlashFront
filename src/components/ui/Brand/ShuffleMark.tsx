import { theme } from '@/tokens/theme';
import Svg, { Path } from 'react-native-svg';

export const ShuffleMark = ({
  size = 32,
  color = theme.colors.primary,
}: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" accessible={false}>
    <Path
      d="M11 11L6 12.5A6 6 0 0 0 2 20L8 40A6 6 0 0 0 15.5 44L20 42.5C14 41 11 38 11 33Z"
      fill={color}
      opacity={0.55}
    />
    <Path
      d="M22 5H36A7 7 0 0 1 43 12V36A7 7 0 0 1 36 43H22A7 7 0 0 1 15 36V12A7 7 0 0 1 22 5Z M35 14H28A6 6 0 0 0 28 26H30A2 2 0 0 1 30 30H23V34H30A6 6 0 0 0 30 22H28A2 2 0 0 1 28 18H35Z"
      fill={color}
      fillRule="evenodd"
      transform="rotate(9 29 24)"
    />
  </Svg>
);
