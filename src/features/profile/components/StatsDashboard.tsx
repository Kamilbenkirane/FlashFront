import { AnalyticsChart } from '@/components/ui/AnalyticsChart';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FeedbackState } from '@/components/ui/FeedbackState/FeedbackState';
import { LoadingState } from '@/components/ui/LoadingState';
import { RecencySuccessChart } from '@/components/ui/RecencySuccessChart';
import { Typography } from '@/components/ui/Typography';
import { RecentActivityCard } from '@/features/profile/components/analytics/RecentActivityCard';
import useProfileAnalytics from '@/hooks/useProfileAnalytics';
import type { AnalyticsRange } from '@/interfaces/Analytics';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const getAccuracyColor = (
  accuracy: number,
): 'success' | 'warning' | 'error' => {
  if (accuracy >= 80) {
    return 'success';
  }

  if (accuracy >= 60) {
    return 'warning';
  }

  return 'error';
};

const getRangeDescription = (range: AnalyticsRange) => {
  switch (range) {
    case 'week':
      return 'Last 7 days';
    case 'month':
      return 'Last 30 days';
    case 'year':
      return 'Last 12 months';
  }
};

const StatCard = ({
  title,
  value,
  subtitle,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}) => {
  return (
    <Card style={styles.statCard}>
      <Typography variant="caption" color="muted" style={styles.statTitle}>
        {title}
      </Typography>
      <Typography variant="heading1" color={color} style={styles.statValue}>
        {value}
      </Typography>
      {subtitle ? (
        <Typography variant="small" color="muted" style={styles.statSubtitle}>
          {subtitle}
        </Typography>
      ) : null}
    </Card>
  );
};

export const StatsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<AnalyticsRange>('week');
  const {
    data: analytics,
    isLoading,
    error,
    reload,
  } = useProfileAnalytics(timeRange, 5, true);

  if (isLoading) {
    return <LoadingState message="Loading analytics..." />;
  }

  if (error) {
    return (
      <FeedbackState
        title="Could not load analytics"
        description={error}
        actionLabel="Try again"
        onAction={() => {
          void reload();
        }}
      />
    );
  }

  if (analytics.overview.totalReviews === 0) {
    return (
      <FeedbackState
        title="No analytics yet"
        description="Start reviewing cards and your progress will show up here."
        icon="chart"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.rangeRow}>
        {(['week', 'month', 'year'] as const).map((range) => (
          <Button
            key={range}
            title={range.charAt(0).toUpperCase() + range.slice(1)}
            variant={timeRange === range ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => setTimeRange(range)}
            className="min-w-[80px]"
            accessibilityState={{ selected: timeRange === range }}
          />
        ))}
      </View>

      <View style={styles.section}>
        <Typography variant="heading2" style={styles.sectionTitle}>
          Review Overview
        </Typography>
        <Typography
          variant="caption"
          color="muted"
          style={styles.sectionSubtitle}
        >
          {getRangeDescription(timeRange)}
        </Typography>

        <View style={styles.statGrid}>
          <StatCard
            title="Total Reviews"
            value={analytics.overview.totalReviews}
            subtitle="review events"
          />
          <StatCard
            title="Cards Reviewed"
            value={analytics.overview.uniqueCardsReviewed}
            subtitle="unique cards"
            color="success"
          />
          <StatCard
            title="Average Accuracy"
            value={`${analytics.overview.accuracy.toFixed(1)}%`}
            subtitle="successful reviews"
            color="warning"
          />
          <StatCard
            title="Active Days"
            value={analytics.overview.activeDays}
            subtitle="days with reviews"
            color="primary"
          />
        </View>

        <View style={styles.statGrid}>
          <StatCard
            title="Known"
            value={analytics.overview.knownReviews}
            subtitle="fast recalls"
            color="success"
          />
          <StatCard
            title="Remembered"
            value={analytics.overview.rememberedReviews}
            subtitle="standard recalls"
            color="primary"
          />
          <StatCard
            title="Incorrect"
            value={analytics.overview.incorrectReviews}
            subtitle="forgotten reviews"
            color="error"
          />
          <StatCard
            title="Correct"
            value={analytics.overview.correctReviews}
            subtitle="successful reviews"
            color={getAccuracyColor(analytics.overview.accuracy)}
          />
        </View>

        <View style={styles.statGrid}>
          <StatCard
            title="Current Streak"
            value={analytics.overview.currentStreak}
            subtitle="days in a row"
            color="primary"
          />
          <StatCard
            title="Longest Streak"
            value={analytics.overview.longestStreak}
            subtitle="personal best"
            color="success"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Typography variant="heading2" style={styles.sectionTitle}>
          Performance Trends
        </Typography>

        <RecencySuccessChart data={analytics.recallRateByDelay} />

        <AnalyticsChart
          title="Accuracy"
          type="line"
          data={analytics.accuracyTrend}
          height={112}
          suffix="%"
        />

        <AnalyticsChart
          title="Review Volume"
          type="bar"
          data={analytics.reviewCountTrend}
          height={112}
          suffix=" reviews"
        />

        <AnalyticsChart
          title="Cards Reviewed"
          type="line"
          data={analytics.cardsReviewedTrend}
          height={112}
          suffix=" cards"
        />

        {analytics.deckBreakdown.length > 0 && (
          <AnalyticsChart
            title="Deck Performance"
            type="pie"
            data={analytics.deckBreakdown.map((deck) => ({
              x: deck.deckName,
              y: deck.totalReviews,
              label: `${deck.accuracy.toFixed(1)}% accuracy`,
            }))}
          />
        )}
      </View>

      <View style={styles.lastSection}>
        <Typography variant="heading2" style={styles.sectionTitle}>
          Recent Activity
        </Typography>

        {analytics.recentActivity.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Typography variant="body" color="muted">
              No recent review activity in this range yet.
            </Typography>
          </Card>
        ) : (
          analytics.recentActivity.map((activity) => (
            <RecentActivityCard
              key={activity.id}
              activity={activity}
              accuracyColor={getAccuracyColor(activity.accuracy)}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.xxxl,
  },
  lastSection: {
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  sectionSubtitle: {
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  statCard: {
    width: '48%',
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  statTitle: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  statValue: {
    marginBottom: 2,
    textAlign: 'center',
  },
  statSubtitle: {
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
});
