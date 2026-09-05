import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { StyleSheet, View } from 'react-native';

interface StudySessionStatsCardProps {
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
}

export const StudySessionStatsCard: React.FC<StudySessionStatsCardProps> = ({
  correctCount,
  incorrectCount,
  accuracy,
}) => {
  return (
    <Card variant="raised" padding="lg" style={styles.statsCard}>
      <Typography variant="caption" color="muted" style={styles.statsTitle}>
        Session Stats
      </Typography>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Typography variant="heading3" color="success">
            {correctCount}
          </Typography>
          <Typography variant="caption" color="muted">
            Correct
          </Typography>
        </View>
        <View style={styles.statItem}>
          <Typography variant="heading3" color="error">
            {incorrectCount}
          </Typography>
          <Typography variant="caption" color="muted">
            Incorrect
          </Typography>
        </View>
        <View style={styles.statItem}>
          <Typography variant="heading3" color="primary">
            {`${Math.round(accuracy * 100)}%`}
          </Typography>
          <Typography variant="caption" color="muted">
            Accuracy
          </Typography>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  statsCard: {
    marginTop: theme.spacing.lg,
  },
  statsTitle: {
    textAlign: 'left',
    marginBottom: theme.spacing.md,
    color: theme.colors.mutedForeground,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
});
