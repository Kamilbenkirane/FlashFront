import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MathText } from '@/components/ui/MathText';
import { normalizePlainTextContent } from '@/components/ui/MathText/mathHtml';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import type {
  StudyChatFlashcardProposal,
  StudyChatNewFlashcardProposal,
  StudyChatProposalActionState,
} from '@/services/studyChat/types';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { StudyChatMessageContent } from './StudyChatMessageContent';

type ProposalKind = 'edit' | 'new';

interface StudyChatProposalCardProps {
  kind: ProposalKind;
  proposal: StudyChatFlashcardProposal | StudyChatNewFlashcardProposal;
  state: StudyChatProposalActionState;
  onToggleEditing: () => void;
  onValidate: () => void;
  onChangeDraft: (
    patch: Partial<
      Pick<
        StudyChatProposalActionState,
        'proposedRecto' | 'proposedVerso' | 'proposedDifficulty'
      >
    >,
  ) => void;
}

export const StudyChatProposalCard: React.FC<StudyChatProposalCardProps> = ({
  kind,
  proposal,
  state,
  onToggleEditing,
  onValidate,
  onChangeDraft,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const isSubmitting = state.status === 'submitting';
  const isSuccess = state.status === 'success';
  const deckName = 'deckName' in proposal ? proposal.deckName : null;
  const previewFront = state.proposedRecto.trim() || 'Add a front prompt';
  const previewBack = state.proposedVerso.trim() || 'Add a back answer';

  const validateLabel = isSuccess
    ? kind === 'edit'
      ? 'Changes saved'
      : 'Added to deck'
    : kind === 'edit'
      ? 'Save changes'
      : 'Add to deck';

  return (
    <Card variant="outline" padding="none" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <AppIcon
            name={kind === 'edit' ? 'sparkles' : 'plus'}
            size={15}
            color={theme.colors.primary}
          />
          <Typography variant="caption" color="primary">
            {kind === 'edit' ? 'Draft edit' : 'New card draft'}
          </Typography>
        </View>
        {deckName ? (
          <Typography variant="caption" color="muted">
            {deckName}
          </Typography>
        ) : null}
      </View>

      <Pressable
        onPress={() => setIsFlipped((current) => !current)}
        style={({ pressed }) => [
          styles.previewPressable,
          pressed && styles.previewPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Draft flashcard ${isFlipped ? 'back' : 'front'}. ${normalizePlainTextContent(isFlipped ? previewBack : previewFront)}`}
        accessibilityHint={
          isFlipped
            ? 'Shows the front of this draft.'
            : 'Shows the back of this draft.'
        }
      >
        <View style={styles.previewFace} pointerEvents="none">
          <Typography variant="caption" color="primary">
            {isFlipped ? 'ANSWER' : 'QUESTION'}
          </Typography>
          <View style={styles.previewContent}>
            <MathText
              content={isFlipped ? previewBack : previewFront}
              renderKey={`proposal-${proposal.proposalId}-${isFlipped ? 'back' : 'front'}`}
              textColor={theme.colors.foreground}
              fontSize={theme.typography.heading3.fontSize}
              lineHeight={theme.typography.heading3.lineHeight}
              textAlign="left"
              verticalAlign="top"
              fillContainer={false}
              layoutMode="auto"
              style={styles.previewMath}
            />
          </View>
          <Typography variant="caption" color="muted">
            {isFlipped ? 'Tap to see the question' : 'Tap to see the answer'}
          </Typography>
        </View>
      </Pressable>

      <View style={styles.meta}>
        <View style={styles.metaBlock}>
          <Typography variant="caption" color="muted" style={styles.metaLabel}>
            Goal
          </Typography>
          <StudyChatMessageContent content={proposal.changeGoal} />
        </View>
        <View style={styles.metaBlock}>
          <Typography variant="caption" color="muted" style={styles.metaLabel}>
            Why this draft
          </Typography>
          <StudyChatMessageContent content={proposal.rationale} />
        </View>
        {proposal.userFeedbackSummary.trim() ? (
          <View style={styles.metaBlock}>
            <Typography
              variant="caption"
              color="muted"
              style={styles.metaLabel}
            >
              Based on your request
            </Typography>
            <StudyChatMessageContent content={proposal.userFeedbackSummary} />
          </View>
        ) : null}
        <Typography
          variant="caption"
          color={isSuccess ? 'success' : 'muted'}
          accessibilityLiveRegion="polite"
        >
          {isSuccess
            ? kind === 'edit'
              ? 'Your changes are saved.'
              : 'Your new card is in your deck.'
            : 'Review the draft and make it your own before saving.'}
        </Typography>
      </View>

      {state.isEditing ? (
        <View style={styles.editor}>
          <View style={styles.field}>
            <Typography variant="caption" color="muted">
              Front
            </Typography>
            <TextInput
              value={state.proposedRecto}
              onChangeText={(value) => onChangeDraft({ proposedRecto: value })}
              style={styles.input}
              placeholder="Draft front"
              placeholderTextColor={theme.colors.placeholder}
              multiline
              editable={!isSubmitting && !isSuccess}
              accessibilityLabel="Draft front"
            />
          </View>

          <View style={styles.field}>
            <Typography variant="caption" color="muted">
              Back
            </Typography>
            <TextInput
              value={state.proposedVerso}
              onChangeText={(value) => onChangeDraft({ proposedVerso: value })}
              style={styles.input}
              placeholder="Draft back"
              placeholderTextColor={theme.colors.placeholder}
              multiline
              editable={!isSubmitting && !isSuccess}
              accessibilityLabel="Draft back"
            />
          </View>

          <View style={styles.field}>
            <Typography variant="caption" color="muted">
              Difficulty · 0 or higher
            </Typography>
            <TextInput
              value={state.proposedDifficulty}
              onChangeText={(value) =>
                onChangeDraft({ proposedDifficulty: value })
              }
              style={styles.difficultyInput}
              placeholder="0"
              placeholderTextColor={theme.colors.placeholder}
              editable={!isSubmitting && !isSuccess}
              keyboardType="decimal-pad"
              accessibilityLabel="Draft difficulty"
            />
          </View>
        </View>
      ) : null}

      {state.errorMessage ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Typography variant="caption" color="error">
            {state.errorMessage}
          </Typography>
        </View>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <Button
            title={validateLabel}
            onPress={onValidate}
            loading={isSubmitting}
            disabled={isSubmitting || isSuccess}
            size="lg"
            variant={isSuccess ? 'success' : 'primary'}
            fullWidth
          />
        </View>
        <View style={styles.actionButton}>
          <Button
            title={state.isEditing ? 'Done editing' : 'Edit draft'}
            onPress={onToggleEditing}
            disabled={isSubmitting || isSuccess}
            size="lg"
            variant="outline"
            fullWidth
          />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
  },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.primaryLight,
  },
  previewPressable: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  previewPressed: {
    opacity: 0.8,
  },
  previewFace: {
    minHeight: 240,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  previewContent: {
    flexGrow: 1,
    minHeight: 112,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewMath: {
    width: '100%',
  },
  meta: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  metaBlock: {
    gap: theme.spacing.xs,
  },
  metaLabel: {
    fontFamily: theme.fontFamily.medium,
  },
  editor: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  field: {
    gap: theme.spacing.xs,
  },
  input: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: theme.colors.input,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.foreground,
    fontFamily: theme.fontFamily.sans,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlignVertical: 'top',
    backgroundColor: theme.colors.background,
  },
  difficultyInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: theme.colors.input,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.foreground,
    fontFamily: theme.fontFamily.sans,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    backgroundColor: theme.colors.background,
  },
  errorBanner: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.destructive.light,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
  },
});
