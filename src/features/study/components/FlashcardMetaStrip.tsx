import { Typography } from '@/components/ui/Typography';
import type { StudyCard } from '@/domain/study/models/Flashcard';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

interface FlashcardMetaStripProps {
  flashcard: Pick<StudyCard, 'secondsSinceLastReview' | 'streak'>;
  style?: StyleProp<ViewStyle>;
}

const formatStreak = (streak: number) =>
  streak > 0 ? `${streak} in a row` : 'Just started';

const formatLastReview = (seconds?: number) => {
  if (seconds === undefined) {
    return 'New card';
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  }

  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h ago`;
  }

  return `${Math.floor(seconds / 86400)}d ago`;
};

export const FlashcardMetaStrip: React.FC<FlashcardMetaStripProps> = ({
  flashcard,
  style,
}) => {
  const items = [
    {
      key: 'streak',
      tone: 'success' as const,
      value: formatStreak(flashcard.streak),
    },
    {
      key: 'review',
      tone:
        flashcard.secondsSinceLastReview === undefined
          ? ('primary' as const)
          : ('warning' as const),
      value: formatLastReview(flashcard.secondsSinceLastReview),
    },
  ];

  return (
    <View style={[styles.row, style]}>
      {items.map((item) => {
        const toneStyles =
          item.tone === 'success'
            ? {
                backgroundColor: theme.colors.success.light,
                textColor: theme.colors.success.DEFAULT,
              }
            : item.tone === 'warning'
              ? {
                  backgroundColor: theme.colors.warning.light,
                  textColor: theme.colors.warning.DEFAULT,
                }
              : {
                  backgroundColor: theme.colors.primaryLight,
                  textColor: theme.colors.primary,
                };

        return (
          <View
            key={item.key}
            style={[
              styles.chip,
              { backgroundColor: toneStyles.backgroundColor },
            ]}
          >
            <Typography
              variant="small"
              style={[styles.chipText, { color: toneStyles.textColor }]}
            >
              {item.value}
            </Typography>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: theme.fontFamily.medium,
    textAlign: 'center',
  },
});
