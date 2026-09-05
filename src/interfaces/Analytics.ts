export type AnalyticsRange = 'week' | 'month' | 'year';

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

interface AnalyticsOverview {
  totalReviews: number;
  correctReviews: number;
  incorrectReviews: number;
  knownReviews: number;
  rememberedReviews: number;
  accuracy: number;
  uniqueCardsReviewed: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
}

interface AnalyticsDeckBreakdown {
  deckId: number;
  deckName: string;
  subject: string;
  totalReviews: number;
  correctReviews: number;
  incorrectReviews: number;
  knownReviews: number;
  rememberedReviews: number;
  accuracy: number;
  uniqueCardsReviewed: number;
  lastReviewedAt: string | null;
}

export interface AnalyticsRecentActivity {
  id: string;
  deckId: number;
  deckName: string;
  subject: string;
  activityDate: string;
  totalReviews: number;
  correctReviews: number;
  incorrectReviews: number;
  knownReviews: number;
  rememberedReviews: number;
  accuracy: number;
  uniqueCardsReviewed: number;
  lastReviewedAt: string;
}

interface AnalyticsDelayBin {
  key: string;
  label: string;
  lowerBoundSeconds: number;
  upperBoundSeconds: number;
}

interface AnalyticsStreakBucket {
  key: string;
  label: string;
  totalReviews: number;
}

export interface AnalyticsRecallRatePoint {
  delayBinKey: string;
  delayBinLabel: string;
  successRate: number | null;
  reviewCount: number;
  correctReviews: number;
  incorrectReviews: number;
}

export interface AnalyticsRecallRateSeries {
  streakBucketKey: string;
  streakBucketLabel: string;
  totalReviews: number;
  points: AnalyticsRecallRatePoint[];
}

export interface AnalyticsRecallRateByDelay {
  delayBins: AnalyticsDelayBin[];
  streakBuckets: AnalyticsStreakBucket[];
  series: AnalyticsRecallRateSeries[];
  firstReviewCount: number;
}

export interface ProfileAnalytics {
  range: AnalyticsRange;
  overview: AnalyticsOverview;
  reviewCountTrend: ChartDataPoint[];
  accuracyTrend: ChartDataPoint[];
  cardsReviewedTrend: ChartDataPoint[];
  deckBreakdown: AnalyticsDeckBreakdown[];
  recentActivity: AnalyticsRecentActivity[];
  recallRateByDelay: AnalyticsRecallRateByDelay;
}

export const createEmptyProfileAnalytics = (
  range: AnalyticsRange = 'week',
): ProfileAnalytics => ({
  range,
  overview: {
    totalReviews: 0,
    correctReviews: 0,
    incorrectReviews: 0,
    knownReviews: 0,
    rememberedReviews: 0,
    accuracy: 0,
    uniqueCardsReviewed: 0,
    activeDays: 0,
    currentStreak: 0,
    longestStreak: 0,
  },
  reviewCountTrend: [],
  accuracyTrend: [],
  cardsReviewedTrend: [],
  deckBreakdown: [],
  recentActivity: [],
  recallRateByDelay: {
    delayBins: [],
    streakBuckets: [],
    series: [],
    firstReviewCount: 0,
  },
});
