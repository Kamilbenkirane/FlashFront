import { Typography } from '@/components/ui/Typography';
import type { StudyCard } from '@/domain/study/models/Flashcard';
import { StyleSheet, View } from 'react-native';

const lastReview = (seconds?: number) => {
  if (seconds === undefined) return 'New card';
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const FlashcardMetaStrip = ({
  flashcard,
}: {
  flashcard: Pick<StudyCard, 'secondsSinceLastReview' | 'streak'>;
}) => (
  <View style={styles.row}>
    <View
      accessible
      accessibilityLabel={`Last review: ${lastReview(flashcard.secondsSinceLastReview)}`}
    >
      <Typography variant="small" color="muted">
        Last review
      </Typography>
      <Typography variant="caption">
        {lastReview(flashcard.secondsSinceLastReview)}
      </Typography>
    </View>
    <View
      accessible
      accessibilityLabel={`Recall streak: ${flashcard.streak}`}
      style={styles.streak}
    >
      <Typography variant="small" color="muted">
        Recall streak
      </Typography>
      <Typography variant="caption">{flashcard.streak} in a row</Typography>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 18,
  },
  streak: { alignItems: 'flex-end' },
});
