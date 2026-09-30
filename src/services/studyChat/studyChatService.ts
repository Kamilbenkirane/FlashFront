import { fetch } from 'expo/fetch';

import { refreshAccessToken } from '@/services/auth/sessionState';
import {
  buildHeaders,
  mapStudyChatChartAttachmentRow,
  mapStudyChatImageAttachmentRow,
  parseErrorMessage,
} from '@/services/backendClient';
import { buildApiUrl } from '@/services/runtimeConfig';
import type {
  StudyChatFlashcardProposal,
  StudyChatNewFlashcardProposal,
  StudyChatRequestMessage,
  StudyChatStreamEvent,
} from '@/services/studyChat/types';

interface StudyChatFlashcardProposalRow {
  proposal_id: string;
  card_id: number;
  deck_id: number;
  original_recto: string;
  original_verso: string;
  original_difficulty: number;
  proposed_recto: string;
  proposed_verso: string;
  proposed_difficulty: number;
  change_goal: string;
  rationale: string;
  user_feedback_summary: string;
}

interface StudyChatNewFlashcardProposalRow {
  proposal_id: string;
  deck_id: number;
  deck_name: string;
  proposed_recto: string;
  proposed_verso: string;
  proposed_difficulty: number;
  change_goal: string;
  rationale: string;
  user_feedback_summary: string;
}

interface StudyChatStreamEventRow {
  type:
    | 'assistant_text_delta'
    | 'tool_status'
    | 'chart_ready'
    | 'image_ready'
    | 'flashcard_proposal_ready'
    | 'new_flashcard_proposal_ready'
    | 'done'
    | 'error';
  text?: string;
  status_label?: string;
  chart?: Parameters<typeof mapStudyChatChartAttachmentRow>[0];
  image?: Parameters<typeof mapStudyChatImageAttachmentRow>[0];
  proposal?: StudyChatFlashcardProposalRow;
  new_flashcard_proposal?: StudyChatNewFlashcardProposalRow;
  message?: string;
}

interface StreamStudyChatReplyParams {
  cardId: string | number;
  deckIds: (string | number)[];
  model: string;
  imageModel: string;
  messages: StudyChatRequestMessage[];
  signal: AbortSignal;
  onEvent: (event: StudyChatStreamEvent) => void;
}

const mapFlashcardProposalRow = (
  row: StudyChatFlashcardProposalRow,
): StudyChatFlashcardProposal => ({
  proposalId: row.proposal_id,
  cardId: row.card_id,
  deckId: row.deck_id,
  originalRecto: row.original_recto,
  originalVerso: row.original_verso,
  originalDifficulty: row.original_difficulty,
  proposedRecto: row.proposed_recto,
  proposedVerso: row.proposed_verso,
  proposedDifficulty: row.proposed_difficulty,
  changeGoal: row.change_goal,
  rationale: row.rationale,
  userFeedbackSummary: row.user_feedback_summary,
});

const mapNewFlashcardProposalRow = (
  row: StudyChatNewFlashcardProposalRow,
): StudyChatNewFlashcardProposal => ({
  proposalId: row.proposal_id,
  deckId: row.deck_id,
  deckName: row.deck_name,
  proposedRecto: row.proposed_recto,
  proposedVerso: row.proposed_verso,
  proposedDifficulty: row.proposed_difficulty,
  changeGoal: row.change_goal,
  rationale: row.rationale,
  userFeedbackSummary: row.user_feedback_summary,
});

const mapStreamEventRow = (
  row: StudyChatStreamEventRow,
): StudyChatStreamEvent => ({
  type: row.type,
  text: row.text,
  statusLabel: row.status_label,
  chart: row.chart ? mapStudyChatChartAttachmentRow(row.chart) : undefined,
  image: row.image ? mapStudyChatImageAttachmentRow(row.image) : undefined,
  proposal: row.proposal ? mapFlashcardProposalRow(row.proposal) : undefined,
  newFlashcardProposal: row.new_flashcard_proposal
    ? mapNewFlashcardProposalRow(row.new_flashcard_proposal)
    : undefined,
  message: row.message,
});

const flushEventBuffer = (
  buffer: string,
  onEvent: (event: StudyChatStreamEvent) => void,
) => {
  const lines = buffer.split('\n');
  const nextBuffer = lines.pop() ?? '';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }
    const parsedEvent = mapStreamEventRow(
      JSON.parse(trimmedLine) as StudyChatStreamEventRow,
    );
    onEvent(parsedEvent);
  }

  return nextBuffer;
};

const streamStudyChatReplyAttempt = async (
  params: StreamStudyChatReplyParams,
  hasRetried = false,
) => {
  const response = await fetch(buildApiUrl('/me/study-chat'), {
    method: 'POST',
    headers: await buildHeaders({
      Accept: 'application/x-ndjson',
    }),
    body: JSON.stringify({
      card_id: Number(params.cardId),
      deck_ids: params.deckIds.map((deckId) => Number(deckId)),
      model: params.model,
      image_model: params.imageModel,
      messages: params.messages,
    }),
    signal: params.signal,
  });

  if (response.status === 401 && !hasRetried) {
    const nextAccessToken = await refreshAccessToken();
    if (nextAccessToken) {
      return streamStudyChatReplyAttempt(params, true);
    }
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (!response.body) {
    throw new Error('Streaming is not supported on this device.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let streamError: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    if (!value) {
      continue;
    }
    const chunk = decoder.decode(value, { stream: true });
    if (!chunk) {
      continue;
    }
    buffer += chunk;
    buffer = flushEventBuffer(buffer, (event) => {
      if (event.type === 'error' && event.message) {
        streamError = event.message;
      }
      params.onEvent(event);
    });
  }

  const trailingChunk = decoder.decode();
  if (trailingChunk) {
    buffer += trailingChunk;
  }

  buffer = flushEventBuffer(buffer, (event) => {
    if (event.type === 'error' && event.message) {
      streamError = event.message;
    }
    params.onEvent(event);
  });

  if (buffer.trim()) {
    const finalEvent = mapStreamEventRow(
      JSON.parse(buffer.trim()) as StudyChatStreamEventRow,
    );
    if (finalEvent.type === 'error' && finalEvent.message) {
      streamError = finalEvent.message;
    }
    params.onEvent(finalEvent);
  }

  if (streamError) {
    throw new Error(streamError);
  }
};

export const streamStudyChatReply = async (
  params: StreamStudyChatReplyParams,
) => {
  return streamStudyChatReplyAttempt(params);
};
