import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { StudyChatChartCard } from '@/features/study/components/StudyChatChartCard';
import { StudyChatImageCard } from '@/features/study/components/StudyChatImageCard';
import { StudyChatMessageContent } from '@/features/study/components/StudyChatMessageContent';
import { StudyChatProposalCard } from '@/features/study/components/StudyChatProposalCard';
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
      scrollViewRef.current?.scrollToEnd({ animated: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [messages, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <KeyboardAvoidingView
          style={styles.keyboardArea}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Card variant="raised" padding="none" style={styles.sheet}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Typography variant="heading3">Ask about this card</Typography>
                <Typography variant="small" color="muted">
                  {deckLabel}
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
                  color={theme.colors.mutedForeground}
                />
              </Pressable>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <Typography variant="small" color="error">
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
                    Loading this card chat...
                  </Typography>
                </View>
              ) : messages.length === 0 ? (
                <View style={styles.emptyState}>
                  <Typography variant="body">
                    Ask for a hint, a mnemonic, a clearer explanation, or a
                    real-world example. You can also ask for a graph, plot, or
                    image.
                  </Typography>
                  <Typography variant="small" color="muted">
                    Web search is available when the answer needs extra context.
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
                          <Typography
                            variant="body"
                            style={{ color: theme.colors.primaryForeground }}
                          >
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
                  placeholder="Ask a follow-up question..."
                  placeholderTextColor={theme.colors.placeholder}
                  style={styles.input}
                  multiline
                  editable={!isStreaming}
                  accessibilityLabel="Study chat message"
                />
                <Button
                  title="Send"
                  onPress={onSend}
                  disabled={!canSend}
                  loading={isStreaming}
                />
              </View>
            ) : unavailableMessage ? (
              <View style={styles.emptyState}>
                <Typography variant="small" color="muted">
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
    backgroundColor: 'rgba(15, 23, 42, 0.18)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  sheet: {
    width: '100%',
    height: '72%',
    maxHeight: 640,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  closeButton: {
    width: 36,
    height: 36,
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
    gap: theme.spacing.md,
  },
  emptyState: {
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.secondary,
  },
  messageRow: {
    width: '100%',
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  assistantMessageRow: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '88%',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
  },
  userMessageBubble: {
    backgroundColor: theme.colors.primary,
  },
  assistantMessageBubble: {
    backgroundColor: theme.colors.secondary,
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
    gap: theme.spacing.sm,
    width: '100%',
    minWidth: 0,
  },
  toolStatus: {
    textAlign: 'left',
  },
  composer: {
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  input: {
    minHeight: 92,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: theme.colors.input,
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.foreground,
    fontFamily: theme.fontFamily.sans,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    textAlignVertical: 'top',
    backgroundColor: theme.colors.background,
  },
});
