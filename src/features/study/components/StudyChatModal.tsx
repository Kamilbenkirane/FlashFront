import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { StudyChatChartCard } from '@/features/study/components/StudyChatChartCard';
import { StudyChatImageCard } from '@/features/study/components/StudyChatImageCard';
import { StudyChatMessageContent } from '@/features/study/components/StudyChatMessageContent';
import { StudyChatProposalCard } from '@/features/study/components/StudyChatProposalCard';
import useReducedMotion from '@/hooks/useReducedMotion';
import type {
  StudyChatFlashcardProposal,
  StudyChatNewFlashcardProposal,
  StudyChatProposalActionState,
  StudyChatUiMessage,
} from '@/services/studyChat/types';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const suggestedPrompts = [
  {
    title: 'Give me a hint',
    detail: 'A nudge before the answer',
    icon: 'lightbulb',
    draft: 'Give me a small hint for this card without revealing the answer.',
  },
  {
    title: 'Make it memorable',
    detail: 'Find a useful memory cue',
    icon: 'sparkles',
    draft: 'Help me remember this card with a simple mnemonic.',
  },
  {
    title: 'Show me an example',
    detail: 'Connect the idea to real life',
    icon: 'book',
    draft: 'Explain this card with one concrete, real-world example.',
  },
  {
    title: 'Visualize the idea',
    detail: 'Explore a chart or illustration',
    icon: 'chart',
    draft:
      'Explain this card visually with a chart or illustration if it would help.',
  },
] as const;

interface StudyChatModalProps {
  visible: boolean;
  onClose: () => void;
  deckLabel: string;
  isComposerAvailable: boolean;
  unavailableMessage?: string | null;
  messages: StudyChatUiMessage[];
  isLoadingHistory: boolean;
  draft: string;
  onChangeDraft: (value: string) => void;
  onSend: () => void;
  getFlashcardProposalActionState: (
    proposal: StudyChatFlashcardProposal,
  ) => StudyChatProposalActionState;
  getNewFlashcardProposalActionState: (
    proposal: StudyChatNewFlashcardProposal,
  ) => StudyChatProposalActionState;
  onToggleFlashcardProposalEditing: (
    proposal: StudyChatFlashcardProposal,
  ) => void;
  onToggleNewFlashcardProposalEditing: (
    proposal: StudyChatNewFlashcardProposal,
  ) => void;
  onChangeFlashcardProposalDraft: (
    proposal: StudyChatFlashcardProposal,
    patch: Partial<
      Pick<
        StudyChatProposalActionState,
        'proposedRecto' | 'proposedVerso' | 'proposedDifficulty'
      >
    >,
  ) => void;
  onChangeNewFlashcardProposalDraft: (
    proposal: StudyChatNewFlashcardProposal,
    patch: Partial<
      Pick<
        StudyChatProposalActionState,
        'proposedRecto' | 'proposedVerso' | 'proposedDifficulty'
      >
    >,
  ) => void;
  onValidateFlashcardProposal: (proposal: StudyChatFlashcardProposal) => void;
  onValidateNewFlashcardProposal: (
    proposal: StudyChatNewFlashcardProposal,
  ) => void;
  isStreaming: boolean;
  error?: string | null;
}

export const StudyChatModal: React.FC<StudyChatModalProps> = ({
  visible,
  onClose,
  deckLabel,
  isComposerAvailable,
  unavailableMessage = null,
  messages,
  isLoadingHistory,
  draft,
  onChangeDraft,
  onSend,
  getFlashcardProposalActionState,
  getNewFlashcardProposalActionState,
  onToggleFlashcardProposalEditing,
  onToggleNewFlashcardProposalEditing,
  onChangeFlashcardProposalDraft,
  onChangeNewFlashcardProposalDraft,
  onValidateFlashcardProposal,
  onValidateNewFlashcardProposal,
  isStreaming,
  error = null,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView | null>(null);
  const canSend =
    isComposerAvailable &&
    draft.trim().length > 0 &&
    !isStreaming &&
    !isLoadingHistory;

  useEffect(() => {
    if (!visible) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: !prefersReducedMotion && !isStreaming,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [isStreaming, messages, prefersReducedMotion, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType={prefersReducedMotion ? 'none' : 'slide'}
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessible={false}
        />
        <KeyboardAvoidingView
          style={[
            styles.keyboardArea,
            {
              paddingTop: insets.top + theme.spacing.sm,
              paddingBottom: insets.bottom + theme.spacing.sm,
            },
          ]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Card
            variant="raised"
            padding="none"
            style={styles.sheet}
            accessibilityViewIsModal
          >
            <View style={styles.header}>
              <View style={styles.assistantMark}>
                <AppIcon
                  name="sparkles"
                  size={22}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.headerCopy}>
                <Typography variant="heading2" accessibilityRole="header">
                  Study assistant
                </Typography>
                <Typography variant="caption" color="muted" numberOfLines={2}>
                  This card · {deckLabel}
                </Typography>
              </View>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close study chat"
                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
              >
                <AppIcon
                  name="close"
                  size={20}
                  color={theme.colors.foreground}
                />
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <Typography variant="caption" color="error">
                  {error}
                </Typography>
              </View>
            ) : null}

            <ScrollView
              ref={scrollViewRef}
              style={styles.messages}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {isLoadingHistory && messages.length === 0 ? (
                <View style={styles.emptyState}>
                  <ActivityIndicator
                    size="small"
                    color={theme.colors.primary}
                  />
                  <Typography variant="body">
                    Opening your conversation…
                  </Typography>
                </View>
              ) : messages.length === 0 ? (
                <View style={styles.welcome}>
                  <Typography
                    variant="caption"
                    color="primary"
                    style={styles.eyebrow}
                  >
                    A LITTLE CLARITY GOES A LONG WAY
                  </Typography>
                  <Typography variant="heading1" style={styles.welcomeTitle}>
                    Make it click.
                  </Typography>
                  <Typography variant="body" color="muted">
                    Find a clearer way to understand this card. Start with a
                    question or try an idea below.
                  </Typography>
                  {isComposerAvailable ? (
                    <View style={styles.suggestions}>
                      {suggestedPrompts.map((prompt) => (
                        <Pressable
                          key={prompt.title}
                          onPress={() => onChangeDraft(prompt.draft)}
                          disabled={isStreaming}
                          style={({ pressed }) => [
                            styles.suggestion,
                            pressed && styles.suggestionPressed,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={prompt.title}
                          accessibilityHint="Adds a suggested question to your message. You can edit it before sending."
                          accessibilityState={{ disabled: isStreaming }}
                        >
                          <AppIcon
                            name={prompt.icon}
                            size={21}
                            color={theme.colors.primary}
                          />
                          <View style={styles.suggestionCopy}>
                            <Typography
                              variant="body"
                              style={styles.suggestionTitle}
                            >
                              {prompt.title}
                            </Typography>
                            <Typography variant="caption" color="muted">
                              {prompt.detail}
                            </Typography>
                          </View>
                          <AppIcon
                            name="chevronRight"
                            size={18}
                            color={theme.colors.mutedForeground}
                          />
                        </Pressable>
                      ))}
                    </View>
                  ) : null}
                  <Typography variant="caption" color="muted">
                    Web search can bring in more context when you need it.
                  </Typography>
                </View>
              ) : (
                messages.map((message) => {
                  const isUserMessage = message.role === 'user';
                  const attachments = message.attachments ?? [];
                  const imageAttachments = message.imageAttachments ?? [];
                  const proposals = message.proposals ?? [];
                  const newFlashcardProposals =
                    message.newFlashcardProposals ?? [];
                  const isEmptyStreamingAssistantMessage =
                    !isUserMessage &&
                    message.status === 'streaming' &&
                    message.content.length === 0 &&
                    attachments.length === 0 &&
                    imageAttachments.length === 0 &&
                    proposals.length === 0 &&
                    newFlashcardProposals.length === 0;
                  return (
                    <View
                      key={message.id}
                      style={[
                        styles.messageRow,
                        isUserMessage
                          ? styles.userMessageRow
                          : styles.assistantMessageRow,
                      ]}
                    >
                      <Typography
                        variant="caption"
                        color={isUserMessage ? 'muted' : 'primary'}
                        style={styles.speaker}
                      >
                        {isUserMessage ? 'You' : 'Study assistant'}
                      </Typography>
                      <View
                        style={[
                          styles.messageBubble,
                          isUserMessage
                            ? styles.userMessageBubble
                            : styles.assistantMessageBubble,
                          message.status === 'error'
                            ? styles.errorMessageBubble
                            : undefined,
                        ]}
                      >
                        {isUserMessage ? (
                          <Typography variant="body" selectable>
                            {message.content}
                          </Typography>
                        ) : isEmptyStreamingAssistantMessage ? (
                          <View
                            style={styles.streamingIndicator}
                            accessibilityRole="progressbar"
                            accessibilityState={{ busy: true }}
                            accessibilityLabel="Assistant is replying"
                          >
                            <ActivityIndicator
                              size="small"
                              color={theme.colors.primary}
                            />
                            {message.toolStatus ? (
                              <Typography
                                variant="caption"
                                color="muted"
                                style={styles.toolStatus}
                              >
                                {message.toolStatus}
                              </Typography>
                            ) : null}
                          </View>
                        ) : (
                          <View
                            accessibilityLiveRegion="polite"
                            style={styles.assistantContent}
                          >
                            {message.content ? (
                              <StudyChatMessageContent
                                content={message.content}
                                isStreaming={message.status === 'streaming'}
                              />
                            ) : null}
                            {message.toolStatus ? (
                              <Typography
                                variant="caption"
                                color="muted"
                                style={styles.toolStatus}
                              >
                                {message.toolStatus}
                              </Typography>
                            ) : null}
                            {attachments.map((attachment) => (
                              <StudyChatChartCard
                                key={attachment.artifactId}
                                attachment={attachment}
                              />
                            ))}
                            {imageAttachments.map((attachment) => (
                              <StudyChatImageCard
                                key={attachment.artifactId}
                                attachment={attachment}
                              />
                            ))}
                            {proposals.map((proposal) => (
                              <StudyChatProposalCard
                                key={proposal.proposalId}
                                kind="edit"
                                proposal={proposal}
                                state={getFlashcardProposalActionState(
                                  proposal,
                                )}
                                onToggleEditing={() =>
                                  onToggleFlashcardProposalEditing(proposal)
                                }
                                onValidate={() =>
                                  onValidateFlashcardProposal(proposal)
                                }
                                onChangeDraft={(patch) =>
                                  onChangeFlashcardProposalDraft(
                                    proposal,
                                    patch,
                                  )
                                }
                              />
                            ))}
                            {newFlashcardProposals.map((proposal) => (
                              <StudyChatProposalCard
                                key={proposal.proposalId}
                                kind="new"
                                proposal={proposal}
                                state={getNewFlashcardProposalActionState(
                                  proposal,
                                )}
                                onToggleEditing={() =>
                                  onToggleNewFlashcardProposalEditing(proposal)
                                }
                                onValidate={() =>
                                  onValidateNewFlashcardProposal(proposal)
                                }
                                onChangeDraft={(patch) =>
                                  onChangeNewFlashcardProposalDraft(
                                    proposal,
                                    patch,
                                  )
                                }
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>

            {isComposerAvailable ? (
              <View style={styles.composer}>
                <TextInput
                  value={draft}
                  onChangeText={onChangeDraft}
                  placeholder="What would you like to understand?"
                  placeholderTextColor={theme.colors.placeholder}
                  style={styles.input}
                  multiline
                  editable={!isStreaming}
                  accessibilityLabel="Study chat message"
                />
                <Button
                  title="Send"
                  size="lg"
                  onPress={onSend}
                  disabled={!canSend}
                  loading={isStreaming}
                />
              </View>
            ) : unavailableMessage ? (
              <View style={styles.emptyState}>
                <Typography variant="caption" color="muted">
                  {unavailableMessage}
                </Typography>
              </View>
            ) : null}
          </Card>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.colors.overlay,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.sm,
  },
  sheet: {
    width: '100%',
    flex: 1,
    maxWidth: 760,
    borderRadius: theme.borderRadius.xxl,
    alignSelf: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  assistantMark: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.secondary,
  },
  errorBanner: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.destructive.light,
  },
  messages: {
    flex: 1,
    minHeight: 0,
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.xxl,
  },
  welcome: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  eyebrow: {
    letterSpacing: 1.2,
    fontFamily: theme.fontFamily.medium,
  },
  welcomeTitle: {
    fontSize: 32,
    lineHeight: 38,
  },
  suggestions: {
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.md,
  },
  suggestion: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xl,
  },
  suggestionPressed: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.primary,
  },
  suggestionCopy: {
    flex: 1,
    gap: 2,
  },
  suggestionTitle: {
    fontFamily: theme.fontFamily.medium,
  },
  emptyState: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.secondary,
  },
  messageRow: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  speaker: {
    fontFamily: theme.fontFamily.medium,
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  assistantMessageRow: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '100%',
    borderRadius: theme.borderRadius.xl,
  },
  userMessageBubble: {
    maxWidth: '90%',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceRaised,
    borderBottomRightRadius: theme.borderRadius.sm,
  },
  assistantMessageBubble: {
    width: '100%',
  },
  errorMessageBubble: {
    borderWidth: 1,
    borderColor: theme.colors.destructive.DEFAULT,
  },
  streamingIndicator: {
    minWidth: 32,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  assistantContent: {
    gap: theme.spacing.lg,
    width: '100%',
    minWidth: 0,
  },
  toolStatus: {
    textAlign: 'left',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  input: {
    flex: 1,
    minHeight: 56,
    maxHeight: 136,
    borderWidth: 1,
    borderColor: theme.colors.input,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    color: theme.colors.foreground,
    fontFamily: theme.fontFamily.sans,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlignVertical: 'top',
    backgroundColor: theme.colors.background,
  },
});
