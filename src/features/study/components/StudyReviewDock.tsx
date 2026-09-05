import { Typography } from '@/components/ui/Typography';
import { AppIcon, type AppIconName } from '@/components/ui/icons';
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
    icon: AppIconName;
    color: string;
    background: string;
    onPress: () => void;
  }[] = [
    {
      outcome: 'forgotten',
      title: 'Again',
      hint: 'I could not recall this',
      icon: 'time',
      color: theme.colors.destructive.DEFAULT,
      background: theme.colors.destructive.light,
      onPress: onForgotten,
    },
    {
      outcome: 'remembered',
      title: 'Got it',
      hint: 'I remembered the answer',
      icon: 'check',
      color: theme.colors.primaryForeground,
      background: theme.colors.primary,
      onPress: onRemembered,
    },
    {
      outcome: 'known',
      title: 'Know it well',
      hint: 'I knew this confidently',
      icon: 'star',
      color: theme.colors.success.DEFAULT,
      background: theme.colors.success.light,
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
              backgroundColor: action.background,
              opacity: disabled ? 0.55 : pressed ? 0.8 : 1,
            },
          ]}
        >
          {pendingOutcome === action.outcome ? (
            <ActivityIndicator size="small" color={action.color} />
          ) : (
            <AppIcon name={action.icon} size={19} color={action.color} />
          )}
          <Typography
            variant="caption"
            style={{
              color: action.color,
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
    minHeight: 72,
    paddingHorizontal: 6,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
