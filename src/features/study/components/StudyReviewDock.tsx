import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import type { StudyReviewOutcome } from '@/domain/study/models/Flashcard';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

interface StudyReviewDockProps {
  visible: boolean;
  onClose: () => void;
  disabled?: boolean;
  pendingOutcome?: StudyReviewOutcome | null;
  onForgotten: () => void;
  onRemembered: () => void;
  onKnown: () => void;
}

interface ReviewActionConfig {
  outcome: StudyReviewOutcome;
  title: string;
  tone: 'destructive' | 'primary' | 'success';
  accessibilityLabel: string;
}

export const StudyReviewDock: React.FC<StudyReviewDockProps> = ({
  visible,
  onClose,
  disabled = false,
  pendingOutcome = null,
  onForgotten,
  onRemembered,
  onKnown,
}) => {
  const actions: (ReviewActionConfig & { onPress: () => void })[] = [
    {
      outcome: 'forgotten',
      title: 'Forgot',
      tone: 'destructive',
      accessibilityLabel: 'Mark card as forgotten',
      onPress: onForgotten,
    },
    {
      outcome: 'known',
      title: 'Known',
      tone: 'primary',
      accessibilityLabel: 'Mark card as confidently known',
      onPress: onKnown,
    },
    {
      outcome: 'remembered',
      title: 'Remember',
      tone: 'success',
      accessibilityLabel: 'Mark card as remembered',
      onPress: onRemembered,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.sheetWrap}
          onPress={(event) => event.stopPropagation()}
          accessibilityViewIsModal
        >
          <Card variant="raised" padding="none" style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Typography
                variant="small"
                color="muted"
                style={styles.headerText}
              >
                Manual review actions
              </Typography>
            </View>

            <View style={styles.actionsRow}>
              {actions.map((action) => (
                <View key={action.outcome} style={styles.actionCell}>
                  <Button
                    title={action.title}
                    onPress={action.onPress}
                    variant={
                      action.tone === 'destructive'
                        ? 'error'
                        : action.tone === 'success'
                          ? 'success'
                          : 'primary'
                    }
                    size="md"
                    fullWidth
                    disabled={disabled}
                    loading={pendingOutcome === action.outcome}
                    accessibilityLabel={action.accessibilityLabel}
                  />
                </View>
              ))}
            </View>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  sheetWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontFamily: theme.fontFamily.medium,
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionCell: {
    flex: 1,
  },
});
