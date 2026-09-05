import { Typography } from '@/components/ui/Typography';
import { theme } from '@/tokens/theme';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

export const PracticeOrbit = ({
  value,
  total,
  label,
  size = 164,
}: { value: number; total: number; label: string; size?: number }) => {
  const progress = total > 0 ? Math.min(Math.max(value / total, 0), 1) : 0;
  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityLabel={`${value} ${label}`}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 180 180"
        style={StyleSheet.absoluteFill}
        accessible={false}
      >
        <Circle
          cx="90"
          cy="90"
          r="72"
          fill="none"
          stroke="#294655"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
        <Ellipse
          cx="90"
          cy="90"
          rx="87"
          ry="41"
          rotation="-35"
          origin="90, 90"
          stroke="#B8924F"
          strokeOpacity="0.4"
          strokeWidth="1"
          fill="none"
        />
        <Circle
          cx="90"
          cy="90"
          r="61"
          fill="#0A2A3B"
          stroke="#294655"
          strokeWidth="3"
        />
        <Circle
          cx="90"
          cy="90"
          r="61"
          fill="none"
          stroke="#D8B878"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${progress * 383.27} 383.27`}
          rotation="-90"
          origin="90, 90"
        />
        <Path
          d="M151 23L153 29L159 31L153 33L151 39L149 33L143 31L149 29Z"
          fill="#D8B878"
        />
        <Circle cx="23" cy="139" r="3" fill="#D8B878" />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Typography style={styles.value}>{value}</Typography>
        <Typography variant="small" color="muted" style={styles.label}>
          {label}
        </Typography>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  value: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -2,
    color: theme.colors.primary,
  },
  label: { fontSize: 11, lineHeight: 16, textAlign: 'center' },
});
