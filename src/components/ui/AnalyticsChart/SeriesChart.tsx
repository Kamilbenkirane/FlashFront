import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import type { ChartDataPoint } from '@/interfaces/Analytics';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { getNearestSeriesIndex, getSeriesGeometry } from './seriesGeometry';
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
  const [plotWidth, setPlotWidth] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(data.length - 1);
  useEffect(() => setSelectedIndex(data.length - 1), [data]);
  const selected = Math.max(0, Math.min(selectedIndex, data.length - 1));
  const selectedPoint = data[selected];
  const { points, maximum, baseline } = getSeriesGeometry(
    data.map((point) => point.y),
    plotWidth,
    plotHeight,
    suffix === '%' ? 100 : undefined,
  );
  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x} ${point.y}`)
    .join(' ');
  const formatMetric = (value: number) =>
    `${Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)}${suffix}`;
  const barWidth = Math.max(
    3,
    Math.min(24, ((plotWidth - 16) / Math.max(data.length, 1)) * 0.5),
  );

  if (!selectedPoint) return null;

  return (
    <View style={styles.series}>
      <View style={styles.seriesHeader} accessibilityLiveRegion="polite">
        <View style={styles.seriesSummary}>
          <Typography variant="heading2" color="primary">
            {formatMetric(selectedPoint.y)}
          </Typography>
          <Typography variant="small" color="muted">
            {selectedPoint.label ?? `${selectedPoint.x}`}
          </Typography>
        </View>
        <View style={styles.seriesControls}>
          <Pressable
            style={styles.seriesControl}
            onPress={() => setSelectedIndex(selected - 1)}
            disabled={selected === 0}
            accessibilityRole="button"
            accessibilityLabel="Previous data point"
            accessibilityState={{ disabled: selected === 0 }}
          >
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <AppIcon
                name="chevronRight"
                size={18}
                color={
                  selected === 0
                    ? theme.colors.placeholder
                    : theme.colors.primary
                }
              />
            </View>
          </Pressable>
          <Pressable
            style={styles.seriesControl}
            onPress={() => setSelectedIndex(selected + 1)}
            disabled={selected === data.length - 1}
            accessibilityRole="button"
            accessibilityLabel="Next data point"
            accessibilityState={{ disabled: selected === data.length - 1 }}
          >
            <AppIcon
              name="chevronRight"
              size={18}
              color={
                selected === data.length - 1
                  ? theme.colors.placeholder
                  : theme.colors.primary
              }
            />
          </Pressable>
        </View>
      </View>
      <View style={styles.plotRow}>
        <View style={[styles.yAxis, { height: plotHeight }]}>
          <Typography variant="small" color="dim">
            {Math.round(maximum)}
          </Typography>
          <Typography variant="small" color="dim">
            {Math.round(maximum / 2)}
          </Typography>
          <Typography variant="small" color="dim">
            0
          </Typography>
        </View>
        <Pressable
          style={styles.plot}
          onLayout={(event) => setPlotWidth(event.nativeEvent.layout.width)}
          onPress={(event) =>
            setSelectedIndex(
              getNearestSeriesIndex(
                event.nativeEvent.locationX,
                plotWidth,
                data.length,
              ),
            )
          }
          accessibilityRole="adjustable"
          accessibilityLabel={`${selectedPoint.label ?? selectedPoint.x}: ${formatMetric(selectedPoint.y)}`}
          accessibilityHint="Tap the chart or use the previous and next buttons to inspect each value"
          accessibilityActions={[
            { name: 'increment', label: 'Next data point' },
            { name: 'decrement', label: 'Previous data point' },
          ]}
          onAccessibilityAction={(event) =>
            setSelectedIndex(
              Math.max(
                0,
                Math.min(
                  data.length - 1,
                  selected +
                    (event.nativeEvent.actionName === 'increment' ? 1 : -1),
                ),
              ),
            )
          }
        >
          <Svg
            width={Math.max(1, plotWidth)}
            height={plotHeight}
            accessible={false}
          >
            {[8, plotHeight / 2, baseline].map((y) => (
              <Line
                key={y}
                x1={0}
                x2={plotWidth}
                y1={y}
                y2={y}
                stroke={theme.colors.border}
                strokeDasharray="3 5"
                strokeWidth={0.7}
              />
            ))}
            {type === 'line' && points.length > 0 ? (
              <>
                <Path
                  d={`${line} L${points[points.length - 1].x} ${baseline} L${points[0].x} ${baseline} Z`}
                  fill={theme.colors.primary}
                  fillOpacity={0.08}
                />
                <Path
                  d={line}
                  fill="none"
                  stroke={theme.colors.primary}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Line
                  x1={points[selected].x}
                  x2={points[selected].x}
                  y1={8}
                  y2={baseline}
                  stroke={theme.colors.primary}
                  opacity={0.25}
                  strokeDasharray="2 4"
                />
                <Circle
                  cx={points[selected].x}
                  cy={points[selected].y}
                  r={4.5}
                  fill={theme.colors.primary}
                  stroke={theme.colors.card}
                  strokeWidth={2}
                />
              </>
            ) : (
              points.map((point, index) => (
                <Rect
                  key={`${data[index].x}-${index}`}
                  x={Math.max(
                    0,
                    Math.min(plotWidth - barWidth, point.x - barWidth / 2),
                  )}
                  y={point.y}
                  width={barWidth}
                  height={baseline - point.y}
                  rx={3}
                  fill={theme.colors.primary}
                  opacity={index === selected ? 1 : 0.42}
                />
              ))
            )}
          </Svg>
        </Pressable>
      </View>
      <View style={styles.axisLabels}>
        <Typography
          variant="small"
          color="muted"
          numberOfLines={1}
        >{`${data[0].x}`}</Typography>
        <Typography
          variant="small"
          color="muted"
          numberOfLines={1}
        >{`${data[data.length - 1].x}`}</Typography>
      </View>
    </View>
  );
};
