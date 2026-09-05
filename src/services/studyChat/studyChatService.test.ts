import { beforeEach, describe, expect, it, vi } from 'vitest';

import { streamStudyChatReply } from '@/services/studyChat/studyChatService';

const {
  fetchMock,
  buildHeadersMock,
  parseErrorMessageMock,
  refreshAccessTokenMock,
} = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  buildHeadersMock: vi.fn(),
  parseErrorMessageMock: vi.fn(),
  refreshAccessTokenMock: vi.fn(),
}));

vi.mock('expo/fetch', () => ({
  fetch: fetchMock,
}));

vi.mock('@/services/auth/sessionState', () => ({
  refreshAccessToken: refreshAccessTokenMock,
}));

vi.mock('@/services/backendClient', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/backendClient')>()),
  buildHeaders: buildHeadersMock,
  parseErrorMessage: parseErrorMessageMock,
}));

vi.mock('@/services/runtimeConfig', () => ({
  buildApiUrl: (path: string) => path,
}));

const createReader = (chunks: string[]) => {
  const encoder = new TextEncoder();
  let index = 0;

  return {
    async read() {
      if (index >= chunks.length) {
        return { done: true, value: undefined };
      }
      const value = encoder.encode(chunks[index]);
      index += 1;
      return { done: false, value };
    },
  };
};

describe('streamStudyChatReply', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    buildHeadersMock.mockReset();
    parseErrorMessageMock.mockReset();
    refreshAccessTokenMock.mockReset();
    buildHeadersMock.mockResolvedValue(new Headers());
  });

  it('parses structured NDJSON events across transport chunks', async () => {
    const receivedEvents: object[] = [];
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      body: {
        getReader: () =>
          createReader([
            '{"type":"tool_status","status_label":"Generating chart..."}\n{"type":"assistant_text_delta","text":"This chart sh',
            'ows the loss shrinking."}\n{"type":"chart_ready","chart":{"artifact_id":"chart-1","title":"Gradient descent","summary":"Loss decreases with each step.","caption":"Illustrative optimization trace.","alt_text":"A curve showing the loss dropping toward the minimum.","chart_type":"line","data_mode":"derived","image_path":"/me/study-chat/artifacts/chart-1","image_data_url":"data:image/png;base64,abc123"}}\n{"type":"done"}\n',
          ]),
      },
      headers: new Headers({
        'content-type': 'application/x-ndjson',
      }),
    });

    await streamStudyChatReply({
      cardId: 12,
      deckIds: [4, 5],
      model: 'gpt-5.4-mini',
      imageModel: 'gemini-3.1-flash-image-preview',
      messages: [{ role: 'user', content: 'Show me a graph.' }],
      signal: new AbortController().signal,
      onEvent: (event) => {
        receivedEvents.push(event);
      },
    });

    expect(buildHeadersMock).toHaveBeenCalledWith({
      Accept: 'application/x-ndjson',
    });
    expect(receivedEvents).toEqual([
      {
        type: 'tool_status',
        text: undefined,
        statusLabel: 'Generating chart...',
        chart: undefined,
        image: undefined,
        proposal: undefined,
        newFlashcardProposal: undefined,
        message: undefined,
      },
      {
        type: 'assistant_text_delta',
        text: 'This chart shows the loss shrinking.',
        statusLabel: undefined,
        chart: undefined,
        image: undefined,
        proposal: undefined,
        newFlashcardProposal: undefined,
        message: undefined,
      },
      {
        type: 'chart_ready',
        text: undefined,
        statusLabel: undefined,
        chart: {
          artifactId: 'chart-1',
          title: 'Gradient descent',
          summary: 'Loss decreases with each step.',
          caption: 'Illustrative optimization trace.',
          altText: 'A curve showing the loss dropping toward the minimum.',
          chartType: 'line',
          dataMode: 'derived',
          imagePath: '/me/study-chat/artifacts/chart-1',
          imageDataUrl: 'data:image/png;base64,abc123',
        },
        image: undefined,
        proposal: undefined,
        newFlashcardProposal: undefined,
        message: undefined,
      },
      {
        type: 'done',
        text: undefined,
        statusLabel: undefined,
        chart: undefined,
        image: undefined,
        proposal: undefined,
        newFlashcardProposal: undefined,
        message: undefined,
      },
    ]);
  });

  it('parses image_ready attachments from the stream', async () => {
    const receivedEvents: object[] = [];
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      body: {
        getReader: () =>
          createReader([
            '{"type":"tool_status","status_label":"Generating image..."}\n{"type":"image_ready","image":{"artifact_id":"image-1","title":"Gradient descent valley","summary":"The ball moves downhill toward the minimum.","caption":"Illustrative gradient descent scene.","alt_text":"A simple illustration of gradient descent moving toward a valley minimum.","image_path":"/me/study-chat/artifacts/image-1","image_data_url":"data:image/png;base64,abc123"}}\n{"type":"done"}\n',
          ]),
      },
      headers: new Headers({
        'content-type': 'application/x-ndjson',
      }),
    });

    await streamStudyChatReply({
      cardId: 12,
      deckIds: [4, 5],
      model: 'gpt-5.4-mini',
      imageModel: 'gemini-3.1-flash-image-preview',
      messages: [{ role: 'user', content: 'Show me an image.' }],
      signal: new AbortController().signal,
      onEvent: (event) => {
        receivedEvents.push(event);
      },
    });

    expect(receivedEvents).toEqual([
      {
        type: 'tool_status',
        text: undefined,
        statusLabel: 'Generating image...',
        chart: undefined,
        image: undefined,
        proposal: undefined,
        newFlashcardProposal: undefined,
        message: undefined,
      },
      {
        type: 'image_ready',
        text: undefined,
        statusLabel: undefined,
        chart: undefined,
        image: {
          artifactId: 'image-1',
          title: 'Gradient descent valley',
          summary: 'The ball moves downhill toward the minimum.',
          caption: 'Illustrative gradient descent scene.',
          altText:
            'A simple illustration of gradient descent moving toward a valley minimum.',
          imagePath: '/me/study-chat/artifacts/image-1',
          imageDataUrl: 'data:image/png;base64,abc123',
        },
        message: undefined,
        proposal: undefined,
        newFlashcardProposal: undefined,
      },
      {
        type: 'done',
        text: undefined,
        statusLabel: undefined,
        chart: undefined,
        image: undefined,
        proposal: undefined,
        newFlashcardProposal: undefined,
        message: undefined,
      },
    ]);
  });

  it('parses proposal events from the stream', async () => {
    const receivedEvents: object[] = [];
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      body: {
        getReader: () =>
          createReader([
            '{"type":"flashcard_proposal_ready","proposal":{"proposal_id":"proposal-edit-card","card_id":12,"deck_id":4,"original_recto":"What is x if 2x = 10?","original_verso":"x = 5","original_difficulty":1,"proposed_recto":"How do you solve 2x = 10?","proposed_verso":"Divide both sides by 2, so x = 5.","proposed_difficulty":1,"change_goal":"Make the wording clearer for beginners.","rationale":"The revised wording makes the card easier to parse.","user_feedback_summary":"The card feels too abrupt."}}\n{"type":"new_flashcard_proposal_ready","new_flashcard_proposal":{"proposal_id":"proposal-new-card","deck_id":7,"deck_name":"Geometry","proposed_recto":"What is the area formula for a triangle?","proposed_verso":"Area = base x height / 2.","proposed_difficulty":1,"change_goal":"Capture the key triangle area formula as a standalone card.","rationale":"The formula is a core fact that deserves its own retrieval prompt.","user_feedback_summary":"The user asked to save a new card from this discussion."}}\n{"type":"done"}\n',
          ]),
      },
      headers: new Headers({
        'content-type': 'application/x-ndjson',
      }),
    });

    await streamStudyChatReply({
      cardId: 12,
      deckIds: [4, 5],
      model: 'gpt-5.4-mini',
      imageModel: 'gemini-3.1-flash-image-preview',
      messages: [{ role: 'user', content: 'Split this into cleaner cards.' }],
      signal: new AbortController().signal,
      onEvent: (event) => {
        receivedEvents.push(event);
      },
    });

    expect(receivedEvents).toEqual([
      {
        type: 'flashcard_proposal_ready',
        text: undefined,
        statusLabel: undefined,
        chart: undefined,
        image: undefined,
        proposal: {
          proposalId: 'proposal-edit-card',
          cardId: 12,
          deckId: 4,
          originalRecto: 'What is x if 2x = 10?',
          originalVerso: 'x = 5',
          originalDifficulty: 1,
          proposedRecto: 'How do you solve 2x = 10?',
          proposedVerso: 'Divide both sides by 2, so x = 5.',
          proposedDifficulty: 1,
          changeGoal: 'Make the wording clearer for beginners.',
          rationale: 'The revised wording makes the card easier to parse.',
          userFeedbackSummary: 'The card feels too abrupt.',
        },
        newFlashcardProposal: undefined,
        message: undefined,
      },
      {
        type: 'new_flashcard_proposal_ready',
        text: undefined,
        statusLabel: undefined,
        chart: undefined,
        image: undefined,
        proposal: undefined,
        newFlashcardProposal: {
          proposalId: 'proposal-new-card',
          deckId: 7,
          deckName: 'Geometry',
          proposedRecto: 'What is the area formula for a triangle?',
          proposedVerso: 'Area = base x height / 2.',
          proposedDifficulty: 1,
          changeGoal:
            'Capture the key triangle area formula as a standalone card.',
          rationale:
            'The formula is a core fact that deserves its own retrieval prompt.',
          userFeedbackSummary:
            'The user asked to save a new card from this discussion.',
        },
        message: undefined,
      },
      {
        type: 'done',
        text: undefined,
        statusLabel: undefined,
        chart: undefined,
        image: undefined,
        proposal: undefined,
        newFlashcardProposal: undefined,
        message: undefined,
      },
    ]);
  });
});
