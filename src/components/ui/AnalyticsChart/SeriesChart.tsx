import { Typography } from '@/components/ui/Typography';
import type { ChartDataPoint } from '@/interfaces/Analytics';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { ScrollView, View } from 'react-native';
import { analyticsChartStyles as styles } from './styles';

interface SeriesChartProps {
  data: ChartDataPoint[];
  type: 'line' | 'bar';
  plotHeight: number;
  suffix?: string;
}

export const SeriesChart: React.FC<SeriesChartProps> = ({
  data,
  type,
  plotHeight,
  suffix = '',
}) => {
  const chartColors = Object.values(theme.colors.chart);
  const maxValue = Math.max(...data.map((point) => point.y), 1);

  const formatMetric = (value: number) => {
    const hasFraction = Math.abs(value % 1) > 0.01;
    const formattedValue = hasFraction
      ? value.toFixed(1)
      : `${Math.round(value)}`;
    return `${formattedValue}${suffix}`;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.seriesContent}
    >
      {data.map((point, index) => {
        const barHeight = Math.max(6, (point.y / maxValue) * plotHeight);
        const color = chartColors[index % chartColors.length];

        return (
          <View
            key={`${point.x}-${index}`}
            style={styles.seriesItem}
            accessible
            accessibilityLabel={`${point.label ?? point.x}: ${formatMetric(point.y)}`}
          >
            <View style={styles.metricSlot}>
              <Typography
                variant="small"
                color="muted"
                style={styles.metricLabel}
                numberOfLines={1}
              >
                {formatMetric(point.y)}
              </Typography>
            </View>
            <View style={[styles.plotTrack, { height: plotHeight }]}>
              <View
                style={[
                  styles.bar,
                  {
                    backgroundColor: color,
                    height: barHeight,
                    opacity: type === 'line' ? 0.9 : 1,
                    width: type === 'line' ? 14 : 22,
                  },
                ]}
              />
            </View>
            <Typography
              variant="small"
              color="muted"
              numberOfLines={1}
              style={styles.axisLabel}
            >
              {`${point.x}`}
            </Typography>
            <View style={styles.captionSlot}>
              <Typography
                variant="small"
                color="dim"
                numberOfLines={2}
                style={styles.captionLabel}
              >
                {point.label ?? `${point.x}`}
              </Typography>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};
