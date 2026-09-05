import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import type {
  AnalyticsRecallRateByDelay,
  AnalyticsRecallRatePoint,
  AnalyticsRecallRateSeries,
} from '@/interfaces/Analytics';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { createRecencySuccessChartStyles } from './RecencySuccessChart.styles';

const Y_TICKS = [100, 50, 0];
const PLOT_HEIGHT = 180;
const PLOT_PADDING = {
  top: 12,
  right: 12,
  bottom: 16,
  left: 12,
};

const formatSuccessRate = (value: number | null) =>
  value === null ? 'No data' : `${value.toFixed(1)}%`;

const formatStreakLabel = (label: string) =>
  label === 'All' ? 'All streaks' : `Streak ${label}`;

const getSuccessTone = (
  value: number | null,
): 'default' | 'success' | 'warning' | 'error' => {
  if (value === null) {
    return 'default';
  }

  if (value >= 80) {
    return 'success';
  }

  if (value >= 60) {
    return 'warning';
  }

  return 'error';
};

interface ChartPoint {
  x: number;
  y: number | null;
}

const buildLineSegments = (points: ChartPoint[]) => {
  const segments: string[] = [];
  let activeSegment = '';

  points.forEach((point) => {
    if (point.y === null) {
      if (activeSegment) {
        segments.push(activeSegment);
        activeSegment = '';
      }
      return;
    }

    const command = activeSegment ? 'L' : 'M';
    activeSegment = `${activeSegment}${command}${point.x} ${point.y} `;
  });

  if (activeSegment) {
    segments.push(activeSegment.trim());
  }

  return segments;
};

const buildChartPoints = (
  points: AnalyticsRecallRatePoint[],
  plotWidth: number,
) => {
  const innerWidth = Math.max(
    plotWidth - PLOT_PADDING.left - PLOT_PADDING.right,
    0,
  );
  const innerHeight = PLOT_HEIGHT - PLOT_PADDING.top - PLOT_PADDING.bottom;

  return points.map((point, index) => {
    const x =
      points.length <= 1
        ? PLOT_PADDING.left + innerWidth / 2
        : PLOT_PADDING.left + (innerWidth * index) / (points.length - 1);
    const y =
      point.successRate === null
        ? null
        : PLOT_PADDING.top + ((100 - point.successRate) / 100) * innerHeight;

    return { x, y };
  });
};

const getAxisAccessibilityLabel = (
  point: AnalyticsRecallRatePoint,
  streakLabel: string,
) => {
  if (point.successRate === null) {
    return `${formatStreakLabel(streakLabel)}, delay ${point.delayBinLabel}, no repeated reviews in this bin.`;
  }

  return `${formatStreakLabel(streakLabel)}, delay ${point.delayBinLabel}, ${point.successRate.toFixed(1)} percent success across ${point.reviewCount} reviews.`;
};

export interface RecencySuccessChartProps {
  data: AnalyticsRecallRateByDelay;
}

export const RecencySuccessChart: React.FC<RecencySuccessChartProps> = ({
  data,
}) => {
  const styles = createRecencySuccessChartStyles(theme);
  const [selectedStreakKey, setSelectedStreakKey] = useState('all');
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);
  const [plotWidth, setPlotWidth] = useState(0);

  const availableBuckets = useMemo(
    () => data.streakBuckets.filter((bucket) => bucket.totalReviews > 0),
    [data.streakBuckets],
  );
  const selectedSeries = useMemo<AnalyticsRecallRateSeries | null>(() => {
    const series = data.series.find(
      (item) => item.streakBucketKey === selectedStreakKey,
    );
    return series ?? data.series[0] ?? null;
  }, [data.series, selectedStreakKey]);

  useEffect(() => {
    if (availableBuckets.length === 0) {
      return;
    }

    if (!availableBuckets.some((bucket) => bucket.key === selectedStreakKey)) {
      setSelectedStreakKey(availableBuckets[0].key);
    }
  }, [availableBuckets, selectedStreakKey]);

  useEffect(() => {
    if (!selectedSeries) {
      setSelectedPointIndex(0);
      return;
    }

    const firstDataIndex = selectedSeries.points.findIndex(
      (point) => point.reviewCount > 0,
    );
    setSelectedPointIndex(firstDataIndex >= 0 ? firstDataIndex : 0);
  }, [selectedSeries]);

  const selectedPoint =
    selectedSeries?.points[selectedPointIndex] ??
    selectedSeries?.points[0] ??
    null;
  const chartPoints = useMemo(
    () =>
      selectedSeries ? buildChartPoints(selectedSeries.points, plotWidth) : [],
    [plotWidth, selectedSeries],
  );
  const lineSegments = useMemo(
    () => buildLineSegments(chartPoints),
    [chartPoints],
  );

  if (data.delayBins.length === 0 || !selectedSeries) {
    return (
      <Card padding="lg" style={styles.panel}>
        <View style={styles.header}>
          <Typography variant="heading3">Recall Rate By Delay</Typography>
          <Typography variant="caption" color="muted">
            How accuracy changes as the gap since the previous review grows.
          </Typography>
        </View>
        <View style={styles.emptyState}>
          <Typography variant="body">
            Repeat reviews unlock this curve.
          </Typography>
          <Typography variant="small" color="muted">
            {data.firstReviewCount > 0
              ? `You have ${data.firstReviewCount} first reviews in this range, but a delay curve appears once cards have a prior review to compare against.`
              : 'Review some cards more than once and the chart will appear here.'}
          </Typography>
        </View>
      </Card>
    );
  }

  return (
    <Card padding="lg" style={styles.panel}>
      <View style={styles.header}>
        <Typography variant="heading3">Recall Rate By Delay</Typography>
        <Typography variant="caption" color="muted">
          How accuracy changes as the gap since the previous review grows.
        </Typography>
      </View>

      <View style={styles.filterRow}>
        {data.streakBuckets.map((bucket) => (
          <View key={bucket.key} style={styles.filterButton}>
            <Button
              title={bucket.label}
              variant={
                selectedStreakKey === bucket.key ? 'primary' : 'secondary'
              }
              size="sm"
              disabled={bucket.totalReviews === 0}
              onPress={() => setSelectedStreakKey(bucket.key)}
              accessibilityHint={`Show recall rate for ${formatStreakLabel(bucket.label)}.`}
              accessibilityState={{
                selected: selectedStreakKey === bucket.key,
              }}
            />
          </View>
        ))}
      </View>

      <View
        style={[
          styles.detailCard,
          {
            backgroundColor: theme.colors.primaryLight,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.detailHeader}>
          <Typography variant="caption" color="muted">
            {formatStreakLabel(selectedSeries.streakBucketLabel)}
          </Typography>
          <Typography
            variant="heading2"
            color={getSuccessTone(selectedPoint?.successRate ?? null)}
          >
            {formatSuccessRate(selectedPoint?.successRate ?? null)}
          </Typography>
          <Typography variant="body">
            {selectedPoint?.delayBinLabel ?? 'No delay bin selected'}
          </Typography>
        </View>

        <View style={styles.detailStatsRow}>
          <View style={styles.detailStat}>
            <Typography variant="small" color="muted">
              Reviews
            </Typography>
            <Typography variant="body">
              {selectedPoint?.reviewCount ?? 0}
            </Typography>
          </View>
          <View style={styles.detailStat}>
            <Typography variant="small" color="muted">
              Correct
            </Typography>
            <Typography variant="body" color="success">
              {selectedPoint?.correctReviews ?? 0}
            </Typography>
          </View>
          <View style={styles.detailStat}>
            <Typography variant="small" color="muted">
              Incorrect
            </Typography>
            <Typography variant="body" color="error">
              {selectedPoint?.incorrectReviews ?? 0}
            </Typography>
          </View>
        </View>
      </View>

      <View style={styles.chartBlock}>
        <View style={styles.chartRow}>
          <View style={styles.yAxis}>
            {Y_TICKS.map((tick) => (
              <Typography
                key={tick}
                variant="small"
                color="muted"
                style={styles.yAxisLabel}
              >
                {`${tick}%`}
              </Typography>
            ))}
          </View>

          <View
            onLayout={(event) => {
              const nextWidth = event.nativeEvent.layout.width;
              if (nextWidth > 0 && nextWidth !== plotWidth) {
                setPlotWidth(nextWidth);
              }
            }}
            style={[
              styles.plotSurface,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            {plotWidth > 0 && (
              <Svg height={PLOT_HEIGHT} width={plotWidth}>
                {Y_TICKS.map((tick) => {
                  const innerHeight =
                    PLOT_HEIGHT - PLOT_PADDING.top - PLOT_PADDING.bottom;
                  const y =
                    PLOT_PADDING.top + ((100 - tick) / 100) * innerHeight;

                  return (
                    <Line
                      key={tick}
                      x1={PLOT_PADDING.left}
                      x2={plotWidth - PLOT_PADDING.right}
                      y1={y}
                      y2={y}
                      stroke={theme.colors.border}
                      strokeDasharray={tick === 0 ? undefined : '4 4'}
                      strokeWidth={1}
                    />
                  );
                })}

                {lineSegments.map((segment, index) => (
                  <Path
                    key={`${selectedSeries.streakBucketKey}-${index}`}
                    d={segment}
                    fill="none"
                    stroke={theme.colors.primary}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                  />
                ))}

                {chartPoints.map((point, index) => {
                  const sourcePoint = selectedSeries.points[index];
                  if (point.y === null) {
                    return null;
                  }

                  return (
                    <Circle
                      key={sourcePoint.delayBinKey}
                      cx={point.x}
                      cy={point.y}
                      fill={
                        index === selectedPointIndex
                          ? theme.colors.primary
                          : theme.colors.card
                      }
                      r={index === selectedPointIndex ? 6 : 4}
                      stroke={theme.colors.primary}
                      strokeWidth={2}
                    />
                  );
                })}
              </Svg>
            )}
          </View>
        </View>

        <View style={styles.axisRow}>
          {selectedSeries.points.map((point, index) => {
            const isSelected = index === selectedPointIndex;

            return (
              <Pressable
                accessibilityLabel={getAxisAccessibilityLabel(
                  point,
                  selectedSeries.streakBucketLabel,
                )}
                accessibilityRole="button"
                key={point.delayBinKey}
                onPress={() => setSelectedPointIndex(index)}
                style={[
                  styles.axisSlot,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primaryLight
                      : theme.colors.card,
                    borderColor: isSelected
                      ? theme.colors.primary
                      : theme.colors.border,
                    opacity: point.reviewCount === 0 ? 0.72 : 1,
                  },
                ]}
              >
                <Typography variant="small" style={styles.axisLabel}>
                  {point.delayBinLabel}
                </Typography>
                <Typography
                  variant="small"
                  color="muted"
                  style={styles.axisCount}
                >
                  {`n=${point.reviewCount}`}
                </Typography>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Typography variant="small" color="muted">
          Delay bins are quantiles, so each bin starts with a similar number of
          reviews before the streak filter is applied.
        </Typography>
        {data.firstReviewCount > 0 ? (
          <Typography variant="small" color="muted">
            {`Excluded ${data.firstReviewCount} first reviews that had no prior delay.`}
          </Typography>
        ) : null}
      </View>
    </Card>
  );
};
