import type React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import type { ChartDataPoint } from '../../../interfaces/StudySession';
import { Typography } from '../Typography';
import { styles } from './styles';

export interface AnalyticsChartProps {
  title: string;
  type: 'line' | 'bar' | 'pie';
  data: ChartDataPoint[];
  height?: number;
  showGrid?: boolean;
  showBezier?: boolean;
  suffix?: string;
  formatYLabel?: (value: string) => string;
  onDataPointClick?: (data: ChartDataPoint) => void;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  title,
  type,
  data,
  height = 220,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <Typography variant="heading3" style={styles.title}>
        {title}
      </Typography>
      <View style={[styles.chartContainer, { height }]}>
        <Text style={{ color: theme.colors.foreground, textAlign: 'center' }}>
          📊 {type.toUpperCase()} Chart
        </Text>
        <Text
          style={{
            color: theme.colors.foreground,
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          Data points: {Array.isArray(data) ? data.length : 'N/A'}
        </Text>
        <Text
          style={{
            color: theme.colors.foreground,
            textAlign: 'center',
            marginTop: 4,
            fontSize: 12,
          }}
        >
          Chart rendering temporarily disabled for debugging
        </Text>
      </View>
    </View>
  );
};
