import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MathText } from '@/components/ui/MathText';
import { Typography } from '@/components/ui/Typography';
import useReducedMotion from '@/hooks/useReducedMotion';
import type {
  StudyChatFlashcardProposal,
  StudyChatNewFlashcardProposal,
  StudyChatProposalActionState,
} from '@/services/studyChat/types';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, TextInput, View } from 'react-native';

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
  const prefersReducedMotion = useReducedMotion();
  const [isFlipped, setIsFlipped] = useState(false);
  const rotation = useRef(new Animated.Value(0)).current;
  const isSubmitting = state.status === 'submitting';
  const isSuccess = state.status === 'success';
  const deckName = 'deckName' in proposal ? proposal.deckName : null;
  const previewFront = state.proposedRecto.trim() || 'Add a front prompt';
  const previewBack = state.proposedVerso.trim() || 'Add a back answer';

  useEffect(() => {
    Animated.spring(rotation, {
      toValue: isFlipped ? 1 : 0,
      useNativeDriver: true,
      damping: prefersReducedMotion ? 100 : 18,
      stiffness: prefersReducedMotion ? 1200 : 220,
      mass: 1,
    }).start();
  }, [isFlipped, prefersReducedMotion, rotation]);

  const frontRotation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const validateLabel = isSuccess
    ? kind === 'edit'
      ? 'Applied'
      : 'Created'
    : 'Validate';

  return (
    <Card variant="outline" padding="none" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Typography variant="caption" color="muted">
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
        style={styles.previewPressable}
        accessibilityRole="button"
        accessibilityLabel={`Draft flashcard preview. ${
          isFlipped ? 'Showing back.' : 'Showing front.'
        } Tap to flip.`}
      >
        <View style={styles.previewStack}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.previewFace,
              styles.previewFaceFront,
              {
                transform: [{ perspective: 1200 }, { rotateY: frontRotation }],
              },
            ]}
          >
            <Typography variant="caption" color="muted">
              Front
            </Typography>
            <View style={styles.previewContent}>
              <MathText
                content={previewFront}
                renderKey={`proposal-front-${proposal.proposalId}-${previewFront}`}
                textColor={theme.colors.foreground}
                fontSize={theme.typography.heading3.fontSize}
                lineHeight={theme.typography.heading3.lineHeight}
                textAlign="center"
                style={styles.previewMath}
              />
            </View>
            <Typography variant="caption" color="dim">
              Tap to flip
            </Typography>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.previewFace,
              styles.previewFaceBack,
              {
                transform: [{ perspective: 1200 }, { rotateY: backRotation }],
              },
            ]}
          >
            <Typography variant="caption" color="muted">
              Back
            </Typography>
            <View style={styles.previewContent}>
              <MathText
                content={previewBack}
                renderKey={`proposal-back-${proposal.proposalId}-${previewBack}`}
                textColor={theme.colors.foreground}
                fontSize={theme.typography.heading3.fontSize}
                lineHeight={theme.typography.heading3.lineHeight}
                textAlign="center"
                style={styles.previewMath}
              />
            </View>
            <Typography variant="caption" color="dim">
              Tap to flip
            </Typography>
          </Animated.View>
        </View>
      </Pressable>

      <View style={styles.meta}>
        <View style={styles.metaBlock}>
          <Typography variant="caption" color="muted">
            Goal
          </Typography>
          <StudyChatMessageContent content={proposal.changeGoal} />
        </View>
        <View style={styles.metaBlock}>
          <Typography variant="caption" color="muted">
            Why this draft
          </Typography>
          <StudyChatMessageContent content={proposal.rationale} />
        </View>
        {proposal.userFeedbackSummary.trim() ? (
          <View style={styles.metaBlock}>
            <Typography variant="caption" color="muted">
              Based on your request
            </Typography>
            <StudyChatMessageContent content={proposal.userFeedbackSummary} />
          </View>
        ) : null}
        <Typography variant="caption" color="muted">
          {kind === 'edit'
            ? 'Nothing changes until you validate this draft.'
            : 'Nothing is added to your deck until you validate this draft.'}
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
              Difficulty
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
        <View style={styles.errorBanner}>
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
            size="sm"
            variant={isSuccess ? 'success' : 'primary'}
            fullWidth
          />
        </View>
        <View style={styles.actionButton}>
          <Button
            title={state.isEditing ? 'Done editing' : 'Adjust'}
            onPress={onToggleEditing}
            disabled={isSubmitting || isSuccess}
            size="sm"
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
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.secondary,
  },
  previewPressable: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  previewStack: {
    height: 220,
  },
  previewFace: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    justifyContent: 'space-between',
    backfaceVisibility: 'hidden',
  },
  previewFaceFront: {
    backgroundColor: theme.colors.card,
  },
  previewFaceBack: {
    backgroundColor: theme.colors.secondary,
  },
  previewContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewMath: {
    width: '100%',
  },
  meta: {
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  metaBlock: {
    gap: theme.spacing.xs,
  },
  editor: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  field: {
    gap: theme.spacing.xs,
  },
  input: {
    minHeight: 84,
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
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
