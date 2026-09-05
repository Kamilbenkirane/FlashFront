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
import Svg, { Circle } from 'react-native-svg';

const getAccuracyColor = (accuracy: number): 'success' | 'warning' | 'error' =>
  accuracy >= 80 ? 'success' : accuracy >= 60 ? 'warning' : 'error';

const rangeLabels = {
  week: 'Last 7 days',
  month: 'Last 30 days',
  year: 'Last 12 months',
};

const StatCard = ({
  title,
  value,
  subtitle,
}: { title: string; value: number; subtitle: string }) => (
  <View style={styles.statCard}>
    <Typography variant="caption" color="muted">
      {title}
    </Typography>
    <Typography variant="heading1" style={styles.statValue}>
      {value.toLocaleString()}
    </Typography>
    <Typography variant="small" color="muted">
      {subtitle}
    </Typography>
  </View>
);

export const StatsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<AnalyticsRange>('week');
  const {
    data: analytics,
    isLoading,
    error,
    reload,
  } = useProfileAnalytics(timeRange, 5, true);
  const { overview } = analytics;

  return (
    <View style={styles.container}>
      <View style={styles.rangeHeader}>
        <Typography variant="caption" color="muted">
          {rangeLabels[timeRange]}
        </Typography>
        <View style={styles.rangeRow} accessibilityRole="tablist">
          {(['week', 'month', 'year'] as const).map((range) => (
            <Pressable
              key={range}
              accessibilityRole="tab"
              accessibilityState={{ selected: timeRange === range }}
              aria-selected={timeRange === range}
              onPress={() => {
                triggerHaptic('selection');
                setTimeRange(range);
              }}
              style={[
                styles.range,
                timeRange === range && styles.rangeSelected,
              ]}
            >
              <Typography
                variant="caption"
                color={timeRange === range ? 'primary' : 'muted'}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Typography>
            </Pressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <Card style={styles.stateCard}>
          <LoadingState message="Bringing your progress into focus…" />
        </Card>
      ) : error ? (
        <Card style={styles.stateCard}>
          <FeedbackState
            title="Your progress couldn't load"
            description={error}
            actionLabel="Try again"
            onAction={() => void reload()}
          />
        </Card>
      ) : overview.totalReviews === 0 ? (
        <Card style={styles.stateCard}>
          <FeedbackState
            title="Your first step starts a story"
            description="No reviews in this range yet. Study a deck, or choose a wider range to see your progress."
            icon="sparkles"
          />
        </Card>
      ) : (
        <>
          <Card padding="lg" style={styles.accuracyCard}>
            <View style={styles.accuracyCopy}>
              <Typography
                variant="small"
                color="primary"
                style={styles.eyebrow}
              >
                RECALL ACCURACY
              </Typography>
              <Typography
                variant="heading1"
                color="primary"
                style={styles.accuracyValue}
              >
                {overview.accuracy.toFixed(1)}
                <Typography style={styles.percent} color="primary">
                  %
                </Typography>
              </Typography>
              <Typography variant="caption" color="muted">
                {overview.correctReviews.toLocaleString()} successful reviews of{' '}
                {overview.totalReviews.toLocaleString()}
              </Typography>
            </View>
            <View
              style={styles.accuracyOrbit}
              accessible={false}
              importantForAccessibility="no-hide-descendants"
            >
              <Svg width={108} height={108} viewBox="0 0 108 108">
                <Circle
                  cx={54}
                  cy={54}
                  r={46}
                  fill="none"
                  stroke={theme.colors.border}
                  strokeWidth={5}
                />
                <Circle
                  cx={54}
                  cy={54}
                  r={46}
                  fill="none"
                  stroke={theme.colors.primary}
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray={289.027}
                  strokeDashoffset={
                    289.027 *
                    (1 - Math.min(100, Math.max(0, overview.accuracy)) / 100)
                  }
                  rotation={-90}
                  origin="54, 54"
                />
                <Circle
                  cx={54}
                  cy={54}
                  r={34}
                  fill="none"
                  stroke={theme.colors.primary}
                  strokeWidth={0.7}
                  strokeDasharray="1 6"
                  opacity={0.4}
                />
              </Svg>
              <View style={styles.orbitIcon}>
                <AppIcon
                  name="sparkles"
                  size={29}
                  color={theme.colors.primary}
                  strokeWidth={1.4}
                />
              </View>
            </View>
          </Card>

          <View style={styles.statGrid}>
            <StatCard
              title="Reviews"
              value={overview.totalReviews}
              subtitle="moments of practice"
            />
            <StatCard
              title="Cards explored"
              value={overview.uniqueCardsReviewed}
              subtitle="unique cards reviewed"
            />
            <StatCard
              title="Active days"
              value={overview.activeDays}
              subtitle="days you showed up"
            />
            <StatCard
              title="Current streak"
              value={overview.currentStreak}
              subtitle={`${overview.longestStreak} day personal best`}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Typography variant="heading2">Your learning rhythm</Typography>
              <Typography variant="caption" color="muted">
                One review at a time.
              </Typography>
            </View>
            <AnalyticsChart
              title="Review volume"
              type="bar"
              data={analytics.reviewCountTrend}
              height={144}
              suffix=" reviews"
            />
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
          </View>

          <Card padding="lg" style={styles.outcomes}>
            <Typography variant="heading3">How you recalled</Typography>
            <View style={styles.outcomeRow}>
              <View style={styles.outcome}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: theme.colors.success.DEFAULT },
                  ]}
                />
                <Typography variant="small" color="muted">
                  Known
                </Typography>
                <Typography variant="heading2">
                  {overview.knownReviews.toLocaleString()}
                </Typography>
                <Typography variant="small" color="muted">
                  fast recall
                </Typography>
              </View>
              <View style={styles.outcome}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
                <Typography variant="small" color="muted">
                  Remembered
                </Typography>
                <Typography variant="heading2">
                  {overview.rememberedReviews.toLocaleString()}
                </Typography>
                <Typography variant="small" color="muted">
                  steady recall
                </Typography>
              </View>
              <View style={styles.outcome}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: theme.colors.destructive.DEFAULT },
                  ]}
                />
                <Typography variant="small" color="muted">
                  Incorrect
                </Typography>
                <Typography variant="heading2">
                  {overview.incorrectReviews.toLocaleString()}
                </Typography>
                <Typography variant="small" color="muted">
                  room to grow
                </Typography>
              </View>
            </View>
          </Card>

          <RecencySuccessChart data={analytics.recallRateByDelay} />
          {analytics.deckBreakdown.length > 0 ? (
            <AnalyticsChart
              title="Your focus, by deck"
              type="pie"
              suffix=" reviews"
              data={analytics.deckBreakdown.map((deck) => ({
                x: deck.deckName,
                y: deck.totalReviews,
                label: `${deck.accuracy.toFixed(1)}% accuracy`,
              }))}
            />
          ) : null}

          <View style={styles.section}>
            <Typography variant="heading2" style={styles.activityTitle}>
              Recent activity
            </Typography>
            {analytics.recentActivity.length === 0 ? (
              <Card>
                <Typography variant="body" color="muted">
                  No recent activity in this range.
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: theme.spacing.lg },
  rangeHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 2,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.secondary,
    padding: 3,
  },
  range: {
    minHeight: 44,
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
  },
  rangeSelected: { backgroundColor: theme.colors.card },
  stateCard: { minHeight: 264, justifyContent: 'center' },
  accuracyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.attention.border,
    minHeight: 180,
  },
  accuracyCopy: { flex: 1, gap: theme.spacing.sm },
  eyebrow: { letterSpacing: 1.8, fontFamily: theme.fontFamily.medium },
  accuracyValue: { fontSize: 48, lineHeight: 56, letterSpacing: -2 },
  percent: { fontSize: 27, lineHeight: 36, letterSpacing: -1 },
  accuracyOrbit: { width: 108, height: 108 },
  orbitIcon: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
  statCard: {
    flex: 1,
    minWidth: 128,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
    gap: 5,
  },
  statValue: { fontSize: 30, lineHeight: 36, letterSpacing: -1 },
  section: { gap: theme.spacing.md, marginTop: theme.spacing.lg },
  sectionHeader: { gap: theme.spacing.xs, marginBottom: theme.spacing.xs },
  chartGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.lg },
  chartColumn: { flex: 1, minWidth: 280 },
  outcomes: { gap: theme.spacing.lg },
  outcomeRow: { flexDirection: 'row', gap: theme.spacing.md },
  outcome: { flex: 1, gap: theme.spacing.xs },
  dot: {
    height: 5,
    width: 24,
    borderRadius: 3,
    marginBottom: theme.spacing.xs,
  },
  activityTitle: { marginBottom: theme.spacing.xs },
});
