import { AnalyticsChart } from '@/components/ui/AnalyticsChart';
import { Card } from '@/components/ui/Card';
import { FeedbackState } from '@/components/ui/FeedbackState/FeedbackState';
import { LoadingState } from '@/components/ui/LoadingState';
import { RecencySuccessChart } from '@/components/ui/RecencySuccessChart';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { RecentActivityCard } from '@/features/profile/components/analytics/RecentActivityCard';
import useProfileAnalytics from '@/hooks/useProfileAnalytics';
import type { AnalyticsRange } from '@/interfaces/Analytics';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import type React from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const getAccuracyColor = (accuracy: number): 'success' | 'warning' | 'error' =>
  accuracy >= 80 ? 'success' : accuracy >= 60 ? 'warning' : 'error';

const rangeLabels = { week: '7 days', month: '30 days', year: '12 months' };

const Stat = ({ title, value }: { title: string; value: string | number }) => (
  <View style={styles.stat}>
    <Typography variant="caption" color="muted">
      {title}
    </Typography>
    <Typography variant="heading3">{value.toLocaleString()}</Typography>
  </View>
);

export const StatsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<AnalyticsRange>('week');
  const [showDetails, setShowDetails] = useState(false);
  const {
    data: analytics,
    isLoading,
    error,
    reload,
  } = useProfileAnalytics(timeRange, 5, true);
  const { overview } = analytics;

  return (
    <View style={styles.container}>
      <View style={styles.rangeRow} accessibilityRole="tablist">
        {(['week', 'month', 'year'] as const).map((range) => (
          <Pressable
            key={range}
            accessibilityRole="tab"
            accessibilityState={{ selected: timeRange === range }}
            aria-selected={timeRange === range}
            onPress={() => {
              if (timeRange !== range) {
                triggerHaptic('selection');
                setTimeRange(range);
              }
            }}
            style={[styles.range, timeRange === range && styles.rangeSelected]}
          >
            <Typography
              variant="caption"
              color={timeRange === range ? 'primary' : 'muted'}
            >
              {rangeLabels[range]}
            </Typography>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <Card style={styles.stateCard}>
          <LoadingState message="Loading progress…" />
        </Card>
      ) : error ? (
        <FeedbackState
          title="Couldn't load progress"
          description={error}
          actionLabel="Try again"
          onAction={() => void reload()}
        />
      ) : overview.totalReviews === 0 ? (
        <FeedbackState
          title="No reviews"
          description="Study a deck or choose another period to see progress."
          icon="chart"
        />
      ) : (
        <>
          <Card padding="lg" style={styles.overview}>
            <View style={styles.accuracy}>
              <Typography variant="body" color="muted">
                Accuracy
              </Typography>
              <Typography
                variant="heading1"
                color="primary"
                style={styles.accuracyValue}
              >
                {overview.accuracy.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="muted">
                {overview.correctReviews.toLocaleString()} of{' '}
                {overview.totalReviews.toLocaleString()} correct
              </Typography>
            </View>
            <View style={styles.statGrid}>
              <Stat title="Reviews" value={overview.totalReviews} />
              <Stat
                title="Cards reviewed"
                value={overview.uniqueCardsReviewed}
              />
              <Stat title="Active days" value={overview.activeDays} />
              <Stat
                title="Current streak"
                value={`${overview.currentStreak} ${overview.currentStreak === 1 ? 'day' : 'days'}`}
              />
            </View>
          </Card>

          <AnalyticsChart
            title="Review volume"
            type="bar"
            data={analytics.reviewCountTrend}
            height={120}
            suffix=" reviews"
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Details"
            accessibilityState={{ expanded: showDetails }}
            aria-expanded={showDetails}
            onPress={() => {
              triggerHaptic('selection');
              setShowDetails(!showDetails);
            }}
            style={styles.detailsButton}
          >
            <Typography variant="button">Details</Typography>
            <AppIcon
              name={showDetails ? 'chevronUp' : 'chevronDown'}
              size={20}
              color={theme.colors.primary}
            />
          </Pressable>

          {showDetails ? (
            <View style={styles.details}>
              <Card padding="lg" style={styles.outcomes}>
                <Typography variant="heading3">Review outcomes</Typography>
                <View style={styles.outcomeGrid}>
                  <Stat title="Known" value={overview.knownReviews} />
                  <Stat title="Remembered" value={overview.rememberedReviews} />
                  <Stat title="Incorrect" value={overview.incorrectReviews} />
                  <Stat
                    title="Longest streak"
                    value={`${overview.longestStreak} ${overview.longestStreak === 1 ? 'day' : 'days'}`}
                  />
                </View>
              </Card>
              <View style={styles.chartGrid}>
                <View style={styles.chartColumn}>
                  <AnalyticsChart
                    title="Accuracy over time"
                    type="line"
                    data={analytics.accuracyTrend}
                    height={128}
                    suffix="%"
                  />
                </View>
                <View style={styles.chartColumn}>
                  <AnalyticsChart
                    title="Cards reviewed"
                    type="line"
                    data={analytics.cardsReviewedTrend}
                    height={128}
                    suffix=" cards"
                  />
                </View>
              </View>
              <RecencySuccessChart data={analytics.recallRateByDelay} />
              {analytics.deckBreakdown.length > 0 ? (
                <AnalyticsChart
                  title="Reviews by deck"
                  type="pie"
                  suffix=" reviews"
                  data={analytics.deckBreakdown.map((deck) => ({
                    x: deck.deckName,
                    y: deck.totalReviews,
                    label: `${deck.accuracy.toFixed(1)}% accuracy`,
                  }))}
                />
              ) : null}
              <View style={styles.activity}>
                <Typography variant="heading3">Recent activity</Typography>
                {analytics.recentActivity.length === 0 ? (
                  <Card>
                    <Typography variant="body" color="muted">
                      No activity in this period.
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
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md },
  rangeRow: {
    flexDirection: 'row',
    gap: 2,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.secondary,
    padding: 3,
  },
  range: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  rangeSelected: { backgroundColor: theme.colors.card },
  stateCard: { minHeight: 220, justifyContent: 'center' },
  overview: { gap: theme.spacing.lg },
  accuracy: { gap: theme.spacing.xs },
  accuracyValue: { fontSize: 40, lineHeight: 48, letterSpacing: -1.5 },
  statGrid: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: theme.spacing.lg,
  },
  stat: { width: '50%', minWidth: 0, gap: 3, paddingRight: theme.spacing.sm },
  detailsButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
  },
  details: { gap: theme.spacing.md },
  outcomes: { gap: theme.spacing.lg },
  outcomeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: theme.spacing.lg,
  },
  chartGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  chartColumn: { flex: 1, minWidth: 250 },
  activity: { gap: theme.spacing.md, paddingTop: theme.spacing.sm },
});
