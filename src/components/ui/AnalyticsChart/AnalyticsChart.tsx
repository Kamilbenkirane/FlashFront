import type { ChartDataPoint } from '@/interfaces/Analytics';
import type React from 'react';
import { View } from 'react-native';
import { Typography } from '../Typography';
import { AnalyticsPanel } from './AnalyticsPanel';
import { BreakdownChart } from './BreakdownChart';
import { SeriesChart } from './SeriesChart';
import { analyticsChartStyles as styles } from './styles';

export interface AnalyticsChartProps {
  title: string;
  type: 'line' | 'bar' | 'pie';
  data: ChartDataPoint[];
  height?: number;
  suffix?: string;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  type,
  data,
  height = 140,
  suffix = '',
}) => {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <AnalyticsPanel title={title}>
      <View>
        {!hasData ? (
          <View style={styles.emptyState}>
            <Typography
              variant="caption"
              color="muted"
              style={styles.emptyMessage}
            >
              No data in this period.
            </Typography>
          </View>
        ) : type === 'pie' ? (
          <BreakdownChart data={data} suffix={suffix} />
        ) : (
          <SeriesChart
            data={data}
            plotHeight={height}
            suffix={suffix}
            type={type}
          />
        )}
      </View>
    </AnalyticsPanel>
  );
};
