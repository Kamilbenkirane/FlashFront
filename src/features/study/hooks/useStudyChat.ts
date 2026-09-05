import { useCallback, useEffect, useRef, useState } from 'react';

import {
  applyStudyChatCardProposalRequest,
  createStudyChatCardFromProposalRequest,
  getStudyChatHistoryRequest,
} from '@/services/backendClient';
import { streamStudyChatReply } from '@/services/studyChat/studyChatService';
import type {
  StudyChatCommittedFlashcard,
  StudyChatHistoryMessage,
  StudyChatProposal,
  StudyChatProposalActionState,
  StudyChatUiMessage,
} from '@/services/studyChat/types';

interface UseStudyChatOptions {
  currentCardId: string | number | null;
  deckIds: (string | number)[];
  modelId: string;
  imageModelId: string;
  onCurrentCardPatched?: (card: StudyChatCommittedFlashcard) => void;
  onNewCardCreated?: (card: StudyChatCommittedFlashcard) => void;
}

const isAbortError = (error: unknown) =>
  error instanceof Error && error.name === 'AbortError';

const createMessageId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const buildProposalKey = (proposal: StudyChatProposal) =>
  `${'cardId' in proposal ? 'edit' : 'new'}:${proposal.proposalId}`;

const createProposalActionState = ({
  proposedRecto,
  proposedVerso,
  proposedDifficulty,
}: StudyChatProposal): StudyChatProposalActionState => ({
  isEditing: false,
  status: 'idle',
  errorMessage: null,
  proposedRecto,
  proposedVerso,
  proposedDifficulty: `${proposedDifficulty}`,
});

const updateMessageById = (
  messages: StudyChatUiMessage[],
  messageId: string,
  updater: (message: StudyChatUiMessage) => StudyChatUiMessage,
) =>
  messages.map((message) =>
    message.id === messageId ? updater(message) : message,
  );

const removeMessageById = (messages: StudyChatUiMessage[], messageId: string) =>
  messages.filter((message) => message.id !== messageId);

const mapHistoryMessageToUiMessage = (
  message: StudyChatHistoryMessage,
): StudyChatUiMessage => ({
  id: `history-${message.messageId}`,
  role: message.role,
  content: message.content,
  createdAt: message.createdAt,
  attachments: message.chartAttachments,
  imageAttachments: message.imageAttachments,
  proposals: [],
  newFlashcardProposals: [],
  toolStatus: null,
  status: 'done',
});

const findLatestPersistedAssistantReply = (
  historyMessages: StudyChatHistoryMessage[],
  userContent: string,
) => {
  const normalizedUserContent = userContent.trim();
  if (!normalizedUserContent) {
    return null;
  }

  for (let index = historyMessages.length - 1; index >= 0; index -= 1) {
    const message = historyMessages[index];
    if (
      message.role === 'user' &&
      message.content.trim() === normalizedUserContent
    ) {
      for (
        let assistantIndex = index + 1;
        assistantIndex < historyMessages.length;
        assistantIndex += 1
      ) {
        const assistantMessage = historyMessages[assistantIndex];
        if (assistantMessage.role === 'assistant') {
          return assistantMessage;
        }
      }
      return null;
    }
  }

  return null;
};

const parseProposalDifficulty = (value: string): number | null => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);
  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return null;
  }

  return parsedValue;
};

const useStudyChat = ({
  currentCardId,
  deckIds,
  modelId,
  imageModelId,
  onCurrentCardPatched,
  onNewCardCreated,
}: UseStudyChatOptions) => {
  const [messages, setMessages] = useState<StudyChatUiMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalActions, setProposalActions] = useState<
    Record<string, StudyChatProposalActionState>
  >({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    stopStreaming();
    setDraft('');
    setError(null);
    setProposalActions({});

    if (currentCardId === null) {
      setMessages([]);
      setIsLoadingHistory(false);
      return () => {
        isCancelled = true;
      };
    }

    setIsLoadingHistory(true);
    void getStudyChatHistoryRequest(currentCardId)
      .then((history) => {
        if (isCancelled) {
          return;
        }
        setMessages(history.messages.map(mapHistoryMessageToUiMessage));
      })
      .catch((nextError) => {
        if (isCancelled) {
          return;
        }
        setMessages([]);
        setError(
          nextError instanceof Error
            ? nextError.message
            : 'Could not load study chat history.',
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingHistory(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentCardId, stopStreaming]);

  useEffect(() => stopStreaming, [stopStreaming]);

  const reconcileLatestPersistedAssistantMessage = useCallback(
    async (assistantMessageId: string, userContent: string) => {
      if (currentCardId === null) {
        return;
      }

      const history = await getStudyChatHistoryRequest(currentCardId);
      const persistedAssistantMessage = findLatestPersistedAssistantReply(
        history.messages,
        userContent,
      );
      if (!persistedAssistantMessage) {
        return;
      }

      setMessages((currentMessages) =>
        updateMessageById(currentMessages, assistantMessageId, (message) => ({
          ...message,
          content: persistedAssistantMessage.content || message.content,
          attachments:
            persistedAssistantMessage.chartAttachments.length > 0
              ? persistedAssistantMessage.chartAttachments
              : message.attachments,
          imageAttachments:
            persistedAssistantMessage.imageAttachments.length > 0
              ? persistedAssistantMessage.imageAttachments
              : message.imageAttachments,
          toolStatus: null,
          status: 'done',
        })),
      );
    },
    [currentCardId],
  );

  const sendMessage = useCallback(async () => {
    const nextDraft = draft.trim();
    if (
      !nextDraft ||
      isStreaming ||
      isLoadingHistory ||
      currentCardId === null ||
      deckIds.length === 0 ||
      !modelId
    ) {
      return;
    }

    const userMessage: StudyChatUiMessage = {
      id: createMessageId('user'),
      role: 'user',
      content: nextDraft,
    };
    const assistantMessageId = createMessageId('assistant');
    const assistantPlaceholder: StudyChatUiMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      attachments: [],
      imageAttachments: [],
      proposals: [],
      newFlashcardProposals: [],
      toolStatus: null,
      status: 'streaming',
    };
    const abortController = new AbortController();
    let receivedEvent = false;
    let receivedToolStatus = false;
    let receivedArtifactEvent = false;

    abortControllerRef.current = abortController;
    setDraft('');
    setError(null);
    setIsStreaming(true);
    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantPlaceholder,
    ]);

    try {
      await streamStudyChatReply({
        cardId: currentCardId,
        deckIds,
        model: modelId,
        imageModel: imageModelId,
        messages: [{ role: 'user', content: nextDraft }],
        signal: abortController.signal,
        onEvent: (event) => {
          if (event.type === 'assistant_text_delta' && event.text) {
            receivedEvent = true;
            setMessages((currentMessages) =>
              updateMessageById(
                currentMessages,
                assistantMessageId,
                (message) => ({
                  ...message,
                  content: message.content + event.text!,
                }),
              ),
            );
            return;
          }

          if (event.type === 'tool_status') {
            receivedEvent = true;
            receivedToolStatus = true;
            setMessages((currentMessages) =>
              updateMessageById(
                currentMessages,
                assistantMessageId,
                (message) => ({
                  ...message,
                  toolStatus: event.statusLabel ?? null,
                }),
              ),
            );
            return;
          }

          if (event.type === 'chart_ready' && event.chart) {
            receivedEvent = true;
            receivedArtifactEvent = true;
            setMessages((currentMessages) =>
              updateMessageById(
                currentMessages,
                assistantMessageId,
                (message) => ({
                  ...message,
                  attachments: [...(message.attachments ?? []), event.chart!],
                  toolStatus: null,
                }),
              ),
            );
            return;
          }

          if (event.type === 'image_ready' && event.image) {
            receivedEvent = true;
            receivedArtifactEvent = true;
            setMessages((currentMessages) =>
              updateMessageById(
                currentMessages,
                assistantMessageId,
                (message) => ({
                  ...message,
                  imageAttachments: [
                    ...(message.imageAttachments ?? []),
                    event.image!,
                  ],
                  toolStatus: null,
                }),
              ),
            );
            return;
          }

          if (event.type === 'flashcard_proposal_ready' && event.proposal) {
            receivedEvent = true;
            setMessages((currentMessages) =>
              updateMessageById(
                currentMessages,
                assistantMessageId,
                (message) => ({
                  ...message,
                  proposals: [...(message.proposals ?? []), event.proposal!],
                  toolStatus: null,
                }),
              ),
            );
            return;
          }

          if (
            event.type === 'new_flashcard_proposal_ready' &&
            event.newFlashcardProposal
          ) {
            receivedEvent = true;
            setMessages((currentMessages) =>
              updateMessageById(
                currentMessages,
                assistantMessageId,
                (message) => ({
                  ...message,
                  newFlashcardProposals: [
                    ...(message.newFlashcardProposals ?? []),
                    event.newFlashcardProposal!,
                  ],
                  toolStatus: null,
                }),
              ),
            );
            return;
          }

          if (event.type === 'done') {
            setMessages((currentMessages) =>
              updateMessageById(
                currentMessages,
                assistantMessageId,
                (message) => ({
                  ...message,
                  status: 'done',
                  toolStatus: null,
                }),
              ),
            );
          }
        },
      });
      if (receivedToolStatus && !receivedArtifactEvent) {
        await reconcileLatestPersistedAssistantMessage(
          assistantMessageId,
          nextDraft,
        );
      }
      setMessages((currentMessages) =>
        updateMessageById(currentMessages, assistantMessageId, (message) => ({
          ...message,
          status: 'done',
          toolStatus: null,
        })),
      );
    } catch (nextError) {
      if (isAbortError(nextError)) {
        return;
      }

      const message =
        nextError instanceof Error
          ? nextError.message
          : 'Could not get a study chat reply.';

      setError(message);
      setMessages((currentMessages) =>
        receivedEvent
          ? updateMessageById(currentMessages, assistantMessageId, (msg) => ({
              ...msg,
              status: 'error',
              toolStatus: null,
            }))
          : removeMessageById(currentMessages, assistantMessageId),
      );
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
      setIsStreaming(false);
    }
  }, [
    currentCardId,
    deckIds,
    draft,
    imageModelId,
    isLoadingHistory,
    isStreaming,
    modelId,
    reconcileLatestPersistedAssistantMessage,
  ]);

  const getProposalActionState = useCallback(
    (proposal: StudyChatProposal): StudyChatProposalActionState =>
      proposalActions[buildProposalKey(proposal)] ??
      createProposalActionState(proposal),
    [proposalActions],
  );

  const toggleProposalEditing = useCallback((proposal: StudyChatProposal) => {
    const proposalKey = buildProposalKey(proposal);
    setProposalActions((currentActions) => {
      const currentAction =
        currentActions[proposalKey] ?? createProposalActionState(proposal);
      return {
        ...currentActions,
        [proposalKey]: {
          ...currentAction,
          isEditing: !currentAction.isEditing,
          errorMessage: null,
          status: currentAction.status === 'success' ? 'success' : 'idle',
        },
      };
    });
  }, []);

  const updateProposalDraft = useCallback(
    (
      proposal: StudyChatProposal,
      patch: Partial<
        Pick<
          StudyChatProposalActionState,
          'proposedRecto' | 'proposedVerso' | 'proposedDifficulty'
        >
      >,
    ) => {
      const proposalKey = buildProposalKey(proposal);
      setProposalActions((currentActions) => {
        const currentAction =
          currentActions[proposalKey] ?? createProposalActionState(proposal);
        return {
          ...currentActions,
          [proposalKey]: {
            ...currentAction,
            ...patch,
            errorMessage: null,
            status: currentAction.status === 'success' ? 'success' : 'idle',
          },
        };
      });
    },
    [],
  );

  const validateProposal = useCallback(
    async (proposal: StudyChatProposal) => {
      const proposalKey = buildProposalKey(proposal);
      const currentAction =
        proposalActions[proposalKey] ?? createProposalActionState(proposal);
      const proposedRecto = currentAction.proposedRecto.trim();
      const proposedVerso = currentAction.proposedVerso.trim();
      const proposedDifficulty = parseProposalDifficulty(
        currentAction.proposedDifficulty,
      );

      if (!proposedRecto || !proposedVerso || proposedDifficulty === null) {
        setProposalActions((currentActions) => ({
          ...currentActions,
          [proposalKey]: {
            ...currentAction,
            status: 'error',
            errorMessage:
              'Front, back, and a non-negative difficulty are required.',
          },
        }));
        return;
      }

      setProposalActions((currentActions) => ({
        ...currentActions,
        [proposalKey]: {
          ...currentAction,
          status: 'submitting',
          errorMessage: null,
        },
      }));

      try {
        const proposalDraft = {
          ...proposal,
          proposedRecto,
          proposedVerso,
          proposedDifficulty,
        };
        const flashcard =
          'cardId' in proposalDraft
            ? await applyStudyChatCardProposalRequest(proposalDraft)
            : await createStudyChatCardFromProposalRequest(proposalDraft);
        setProposalActions((currentActions) => ({
          ...currentActions,
          [proposalKey]: {
            ...currentAction,
            proposedRecto,
            proposedVerso,
            proposedDifficulty: `${proposedDifficulty}`,
            isEditing: false,
            status: 'success',
            errorMessage: null,
          },
        }));
        if ('cardId' in proposal) onCurrentCardPatched?.(flashcard);
        else onNewCardCreated?.(flashcard);
      } catch (proposalError) {
        setProposalActions((currentActions) => ({
          ...currentActions,
          [proposalKey]: {
            ...currentAction,
            status: 'error',
            errorMessage:
              proposalError instanceof Error
                ? proposalError.message
                : 'cardId' in proposal
                  ? 'Could not validate this card draft.'
                  : 'Could not create this card draft.',
          },
        }));
      }
    },
    [onCurrentCardPatched, onNewCardCreated, proposalActions],
  );

  return {
    messages,
    draft,
    isLoadingHistory,
    isStreaming,
    error,
    setDraft,
    sendMessage,
    stopStreaming,
    getProposalActionState,
    toggleProposalEditing,
    updateProposalDraft,
    validateProposal,
  };
};

export default useStudyChat;
