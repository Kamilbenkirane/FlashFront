import { Typography } from '@/components/ui/Typography';
import { theme } from '@/tokens/theme';
import { StyleSheet, View } from 'react-native';

interface StudySessionStatsCardProps {
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
}
export const StudySessionStatsCard = ({
  correctCount,
  incorrectCount,
  accuracy,
}: StudySessionStatsCardProps) => (
  <View style={styles.row}>
    {[
      { value: `${correctCount}`, label: 'Recalled' },
      { value: `${incorrectCount}`, label: 'Revisited' },
      { value: `${Math.round(accuracy * 100)}%`, label: 'Recall rate' },
    ].map((stat) => (
      <View key={stat.label} style={styles.item}>
        <Typography style={styles.value}>{stat.value}</Typography>
        <Typography variant="small" color="muted">
          {stat.label}
        </Typography>
      </View>
    ))}
  </View>
);
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 24,
  },
  item: { flex: 1, alignItems: 'center', gap: 5 },
  value: {
    fontFamily: theme.fontFamily.medium,
    fontSize: 25,
    lineHeight: 32,
    color: theme.colors.foreground,
  },
});
