import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  applyStudyChatCardProposalRequest,
  createStudyChatCardFromProposalRequest,
  getStudyChatHistoryRequest,
} from '@/services/backendClient';

const { fetchMock, getAccessTokenMock, refreshAccessTokenMock } = vi.hoisted(
  () => ({
    fetchMock: vi.fn(),
    getAccessTokenMock: vi.fn(),
    refreshAccessTokenMock: vi.fn(),
  }),
);

vi.mock('@/services/auth/sessionState', () => ({
  getAccessToken: getAccessTokenMock,
  refreshAccessToken: refreshAccessTokenMock,
}));

vi.mock('@/services/runtimeConfig', () => ({
  buildApiUrl: (path: string) => `https://api.example${path}`,
}));

describe('getStudyChatHistoryRequest', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    getAccessTokenMock.mockReset();
    refreshAccessTokenMock.mockReset();
    getAccessTokenMock.mockReturnValue('access-token');
    vi.stubGlobal('fetch', fetchMock);
  });

  it('maps persisted history attachments into the UI shape', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          thread_id: 7,
          messages: [
            {
              message_id: 11,
              role: 'user',
              content: 'Show me the previous chart',
              created_at: '2026-04-04T15:00:00Z',
              chart_attachments: [],
              image_attachments: [],
            },
            {
              message_id: 12,
              role: 'assistant',
              content: 'Here it is again.',
              created_at: '2026-04-04T15:00:05Z',
              chart_attachments: [
                {
                  artifact_id: 'chart-1',
                  title: 'Gradient descent',
                  summary: 'Loss decreases with each step.',
                  caption: 'Illustrative optimization trace.',
                  alt_text:
                    'A curve showing the loss dropping toward the minimum.',
                  chart_type: 'line',
                  data_mode: 'derived',
                  image_path: 'https://signed.example/charts/chart-1.png',
                  image_data_url: '',
                },
              ],
              image_attachments: [
                {
                  artifact_id: 'image-1',
                  title: 'Gradient descent valley',
                  summary: 'The ball moves downhill toward the minimum.',
                  caption: 'Illustrative gradient descent scene.',
                  alt_text:
                    'A simple illustration of gradient descent moving toward a valley minimum.',
                  image_path: 'https://signed.example/images/image-1.png',
                  image_data_url: '',
                },
              ],
            },
          ],
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );

    const result = await getStudyChatHistoryRequest(12);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('https://api.example/me/study-chat/history?card_id=12');
    expect(init?.headers).toBeInstanceOf(Headers);
    expect((init?.headers as Headers).get('Authorization')).toBe(
      'Bearer access-token',
    );
    expect(result).toEqual({
      threadId: 7,
      messages: [
        {
          messageId: 11,
          role: 'user',
          content: 'Show me the previous chart',
          createdAt: '2026-04-04T15:00:00Z',
          chartAttachments: [],
          imageAttachments: [],
        },
        {
          messageId: 12,
          role: 'assistant',
          content: 'Here it is again.',
          createdAt: '2026-04-04T15:00:05Z',
          chartAttachments: [
            {
              artifactId: 'chart-1',
              title: 'Gradient descent',
              summary: 'Loss decreases with each step.',
              caption: 'Illustrative optimization trace.',
              altText: 'A curve showing the loss dropping toward the minimum.',
              chartType: 'line',
              dataMode: 'derived',
              imagePath: 'https://signed.example/charts/chart-1.png',
              imageDataUrl: undefined,
            },
          ],
          imageAttachments: [
            {
              artifactId: 'image-1',
              title: 'Gradient descent valley',
              summary: 'The ball moves downhill toward the minimum.',
              caption: 'Illustrative gradient descent scene.',
              altText:
                'A simple illustration of gradient descent moving toward a valley minimum.',
              imagePath: 'https://signed.example/images/image-1.png',
              imageDataUrl: undefined,
            },
          ],
        },
      ],
    });
  });
});

describe('study chat proposal mutations', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    getAccessTokenMock.mockReset();
    refreshAccessTokenMock.mockReset();
    getAccessTokenMock.mockReturnValue('access-token');
    vi.stubGlobal('fetch', fetchMock);
  });

  it('posts the current-card proposal payload and maps the updated card', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          card_id: 12,
          deck_id: 4,
          recto: 'How do you solve 2x = 10?',
          verso: 'Divide both sides by 2, so x = 5.',
          difficulty: 1,
          creation_date: '2026-04-04T16:00:00Z',
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );

    const result = await applyStudyChatCardProposalRequest({
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
      rationale:
        'The revised wording makes the card easier to parse and explicitly states the operation used to isolate x.',
      userFeedbackSummary:
        'The card feels too abrupt and could explain the algebraic step more clearly.',
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe('https://api.example/me/study-chat/apply-card-proposal');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      proposal: {
        proposal_id: 'proposal-edit-card',
        card_id: 12,
        deck_id: 4,
        original_recto: 'What is x if 2x = 10?',
        original_verso: 'x = 5',
        original_difficulty: 1,
        proposed_recto: 'How do you solve 2x = 10?',
        proposed_verso: 'Divide both sides by 2, so x = 5.',
        proposed_difficulty: 1,
        change_goal: 'Make the wording clearer for beginners.',
        rationale:
          'The revised wording makes the card easier to parse and explicitly states the operation used to isolate x.',
        user_feedback_summary:
          'The card feels too abrupt and could explain the algebraic step more clearly.',
      },
    });
    expect(result).toEqual({
      cardId: 12,
      deckId: 4,
      recto: 'How do you solve 2x = 10?',
      verso: 'Divide both sides by 2, so x = 5.',
      difficulty: 1,
      creationDate: '2026-04-04T16:00:00Z',
    });
  });

  it('posts the new-card proposal payload and maps the created card', async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          card_id: 19,
          deck_id: 7,
          recto: 'What is the area formula for a triangle?',
          verso: 'Area = base x height / 2.',
          difficulty: 1,
          creation_date: '2026-04-04T16:05:00Z',
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );

    const result = await createStudyChatCardFromProposalRequest({
      proposalId: 'proposal-new-card',
      deckId: 7,
      deckName: 'Geometry',
      proposedRecto: 'What is the area formula for a triangle?',
      proposedVerso: 'Area = base x height / 2.',
      proposedDifficulty: 1,
      changeGoal: 'Capture the key triangle area formula as a standalone card.',
      rationale:
        'The formula is a core fact that deserves its own retrieval prompt.',
      userFeedbackSummary:
        'The user asked to save a new card from this discussion.',
    });

    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe(
      'https://api.example/me/study-chat/create-card-from-proposal',
    );
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      proposal: {
        proposal_id: 'proposal-new-card',
        deck_id: 7,
        deck_name: 'Geometry',
        proposed_recto: 'What is the area formula for a triangle?',
        proposed_verso: 'Area = base x height / 2.',
        proposed_difficulty: 1,
        change_goal:
          'Capture the key triangle area formula as a standalone card.',
        rationale:
          'The formula is a core fact that deserves its own retrieval prompt.',
        user_feedback_summary:
          'The user asked to save a new card from this discussion.',
      },
    });
    expect(result).toEqual({
      cardId: 19,
      deckId: 7,
      recto: 'What is the area formula for a triangle?',
      verso: 'Area = base x height / 2.',
      difficulty: 1,
      creationDate: '2026-04-04T16:05:00Z',
    });
  });
});
