import type React from 'react';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useAnalytics } from '../../../context/AnalyticsContext';
import { AnalyticsChart } from '../AnalyticsChart';
import { Button } from '../Button';
import { Card } from '../Card';
import { Typography } from '../Typography';

export interface StatsDashboardProps {
  userId: string;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ userId }) => {
  const { getStudyStats, getAnalyticsData, getRecentSessions } = useAnalytics();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  const studyStats = getStudyStats(userId);
  const analyticsData = getAnalyticsData(userId, timeRange);
  const recentSessions = getRecentSessions(userId, 5);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
  }) => (
    <Card className="w-[48%] mb-3 p-4 items-center">
      <Typography
        variant="caption"
        color="neutral"
        className="mb-1 text-center"
      >
        {title}
      </Typography>
      <Typography
        variant="heading1"
        color={color}
        className="mb-0.5 text-center"
      >
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="small" color="neutral" className="text-center">
          {subtitle}
        </Typography>
      )}
    </Card>
  );

  const TimeRangeSelector = () => (
    <View className="flex-row justify-center mb-6 gap-2">
      {(['week', 'month', 'year'] as const).map((range) => (
        <Button
          key={range}
          title={range.charAt(0).toUpperCase() + range.slice(1)}
          variant={timeRange === range ? 'primary' : 'secondary'}
          size="sm"
          onPress={() => setTimeRange(range)}
          className="min-w-[80px]"
        />
      ))}
    </View>
  );

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      {/* Summary Stats */}
      <View className="mb-6">
        <Typography variant="heading2" className="mb-4 text-center">
          Study Overview
        </Typography>

        <View className="flex-row flex-wrap justify-between mb-4">
          <StatCard
            title="Total Sessions"
            value={studyStats.totalSessions}
            subtitle="study sessions"
          />
          <StatCard
            title="Study Time"
            value={formatTime(studyStats.totalStudyTime)}
            subtitle="total time"
            color="success"
          />
          <StatCard
            title="Cards Studied"
            value={studyStats.totalCardsStudied}
            subtitle="flashcards"
            color="warning"
          />
          <StatCard
            title="Average Accuracy"
            value={`${studyStats.averageAccuracy.toFixed(1)}%`}
            subtitle="correct answers"
            color={
              studyStats.averageAccuracy >= 80
                ? 'success'
                : studyStats.averageAccuracy >= 60
                  ? 'warning'
                  : 'error'
            }
          />
        </View>

        <View className="flex-row justify-between">
          <StatCard
            title="Current Streak"
            value={studyStats.currentStreak}
            subtitle="days in a row"
            color="primary"
          />
          <StatCard
            title="Longest Streak"
            value={studyStats.longestStreak}
            subtitle="personal best"
            color="success"
          />
        </View>
      </View>

      {/* Time Range Selector */}
      <TimeRangeSelector />

      {/* Charts Section */}
      <View className="mb-6">
        <Typography variant="heading2" className="mb-4 text-center">
          Performance Trends
        </Typography>

        {/* Accuracy Trend */}
        <AnalyticsChart
          title="Accuracy Over Time"
          type="line"
          data={analyticsData.accuracyTrend}
          height={200}
          showBezier={true}
          suffix="%"
        />

        {/* Study Time Trend */}
        <AnalyticsChart
          title="Study Time Trend"
          type="bar"
          data={analyticsData.studyTimeTrend}
          height={200}
          suffix=" min"
        />

        {/* Cards Studied */}
        <AnalyticsChart
          title="Cards Studied"
          type="line"
          data={analyticsData.cardsStudiedTrend}
          height={200}
          suffix=" cards"
        />

        {/* Deck Performance */}
        {analyticsData.deckPerformance.length > 0 && (
          <AnalyticsChart
            title="Deck Performance"
            type="pie"
            data={analyticsData.deckPerformance.map((deck) => ({
              x: deck.deckName,
              y: deck.accuracy,
              label: `${deck.deckName}: ${deck.accuracy.toFixed(1)}%`,
            }))}
            height={250}
          />
        )}
      </View>

      {/* Recent Sessions */}
      <View className="mb-6">
        <Typography variant="heading2" className="mb-4 text-center">
          Recent Sessions
        </Typography>

        {recentSessions.length === 0 ? (
          <Card className="p-6 items-center">
            <Typography variant="body" color="neutral">
              No study sessions yet. Start studying to see your progress!
            </Typography>
          </Card>
        ) : (
          recentSessions.map((session) => (
            <Card key={session.id} className="mb-2 p-4">
              <View className="flex-row justify-between items-center mb-3">
                <Typography variant="body" className="flex-1 font-semibold">
                  {session.deckName}
                </Typography>
                <Typography variant="caption" color="neutral">
                  {new Date(session.completedDate).toLocaleDateString()}
                </Typography>
              </View>

              <View className="flex-row justify-around">
                <View className="items-center">
                  <Typography variant="small" color="neutral">
                    Accuracy
                  </Typography>
                  <Typography
                    variant="body"
                    color={
                      session.accuracy >= 80
                        ? 'success'
                        : session.accuracy >= 60
                          ? 'warning'
                          : 'error'
                    }
                  >
                    {session.accuracy.toFixed(1)}%
                  </Typography>
                </View>

                <View className="items-center">
                  <Typography variant="small" color="neutral">
                    Cards
                  </Typography>
                  <Typography variant="body">{session.cardsStudied}</Typography>
                </View>

                <View className="items-center">
                  <Typography variant="small" color="neutral">
                    Time
                  </Typography>
                  <Typography variant="body">
                    {formatTime(session.duration || 0)}
                  </Typography>
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
};
