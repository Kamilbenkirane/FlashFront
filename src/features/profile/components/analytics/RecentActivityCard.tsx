import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import type { AnalyticsRecentActivity } from '@/interfaces/Analytics';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { StyleSheet, View } from 'react-native';

interface RecentActivityCardProps {
  activity: AnalyticsRecentActivity;
  accuracyColor: 'success' | 'warning' | 'error';
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
  activity,
  accuracyColor,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.textColumn}>
          <Typography variant="body" style={styles.deckName} numberOfLines={2}>
            {activity.deckName}
          </Typography>
          <Typography variant="small" color="muted" numberOfLines={1}>
            {activity.subject}
          </Typography>
        </View>
        <Typography
          variant="caption"
          color="muted"
          numberOfLines={1}
          style={styles.dateText}
        >
          {new Date(activity.activityDate).toLocaleDateString()}
        </Typography>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Typography variant="small" color="muted">
            Accuracy
          </Typography>
          <Typography variant="body" color={accuracyColor}>
            {activity.accuracy.toFixed(1)}%
          </Typography>
        </View>

        <View style={styles.metricItem}>
          <Typography variant="small" color="muted">
            Cards
          </Typography>
          <Typography variant="body">{activity.uniqueCardsReviewed}</Typography>
        </View>

        <View style={styles.metricItem}>
          <Typography variant="small" color="muted">
            Reviews
          </Typography>
          <Typography variant="body">{activity.totalReviews}</Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  deckName: {
    fontFamily: theme.fontFamily.medium,
  },
  dateText: {
    maxWidth: 96,
    textAlign: 'right',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
});
