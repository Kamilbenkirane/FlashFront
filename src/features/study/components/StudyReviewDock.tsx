import { Typography } from '@/components/ui/Typography';
import type { StudyReviewOutcome } from '@/domain/study/models/Flashcard';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

interface StudyReviewDockProps {
  disabled?: boolean;
  pendingOutcome?: StudyReviewOutcome | null;
  onForgotten: () => void;
  onRemembered: () => void;
  onKnown: () => void;
}

export const StudyReviewDock = ({
  disabled,
  pendingOutcome,
  onForgotten,
  onRemembered,
  onKnown,
}: StudyReviewDockProps) => {
  const actions: {
    outcome: StudyReviewOutcome;
    title: string;
    hint: string;
    onPress: () => void;
  }[] = [
    {
      outcome: 'forgotten',
      title: 'Again',
      hint: 'I could not recall this',
      onPress: onForgotten,
    },
    {
      outcome: 'remembered',
      title: 'Got it',
      hint: 'I remembered the answer',
      onPress: onRemembered,
    },
    {
      outcome: 'known',
      title: 'Easy',
      hint: 'I knew this confidently',
      onPress: onKnown,
    },
  ];
  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.outcome}
          onPress={() => {
            triggerHaptic('selection');
            action.onPress();
          }}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={action.hint}
          accessibilityState={{
            disabled,
            busy: pendingOutcome === action.outcome,
          }}
          style={({ pressed }) => [
            styles.action,
            {
              opacity: disabled ? 0.55 : pressed ? 0.8 : 1,
            },
          ]}
        >
          {pendingOutcome === action.outcome ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : null}
          <Typography
            variant="caption"
            style={{
              color: theme.colors.foreground,
              fontFamily: theme.fontFamily.semibold,
              textAlign: 'center',
            }}
          >
            {action.title}
          </Typography>
        </Pressable>
      ))}
    </View>
  );
};
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, width: '100%' },
  action: {
    flex: 1,
    minHeight: 56,
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.input,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
