import { Typography } from '@/components/ui/Typography';
import type { ChartDataPoint } from '@/interfaces/Analytics';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { View } from 'react-native';
import { analyticsChartStyles as styles } from './styles';

interface BreakdownChartProps {
  data: ChartDataPoint[];
  suffix?: string;
}

export const BreakdownChart: React.FC<BreakdownChartProps> = ({
  data,
  suffix = '',
}) => {
  const chartColors = Object.values(theme.colors.chart);
  const totalValue = data.reduce((total, point) => total + point.y, 0);

  const formatMetric = (value: number) => {
    const hasFraction = Math.abs(value % 1) > 0.01;
    const formattedValue = hasFraction
      ? value.toFixed(1)
      : `${Math.round(value)}`;
    return `${formattedValue}${suffix}`;
  };

  return (
    <View style={styles.breakdownList}>
      {data.map((point, index) => {
        const color = chartColors[index % chartColors.length];
        const percentage = totalValue > 0 ? (point.y / totalValue) * 100 : 0;

        return (
          <View
            key={`${point.x}-${index}`}
            style={styles.breakdownRow}
            accessible
            accessibilityLabel={`${point.x}. ${formatMetric(point.y)}. ${point.label ?? ''}`.trim()}
          >
            <View style={styles.breakdownHeader}>
              <View style={styles.breakdownTitleRow}>
                <View
                  style={[styles.breakdownSwatch, { backgroundColor: color }]}
                  accessible={false}
                />
                <Typography
                  variant="body"
                  numberOfLines={2}
                  style={styles.breakdownTitle}
                >
                  {`${point.x}`}
                </Typography>
              </View>
              <Typography
                variant="caption"
                color="muted"
                numberOfLines={1}
                style={styles.breakdownMetric}
              >
                {formatMetric(point.y)}
              </Typography>
            </View>
            <View style={styles.breakdownTrack}>
              <View
                style={[
                  styles.breakdownFill,
                  {
                    backgroundColor: color,
                    width: `${Math.max(percentage, 4)}%`,
                  },
                ]}
              />
            </View>
            {point.label ? (
              <Typography variant="small" color="muted">
                {point.label}
              </Typography>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};
