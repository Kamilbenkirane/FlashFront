import type {
  AnalyticsRange,
  Deck,
  ProfileAnalytics,
  SessionData,
  User,
} from '../interfaces';
import { getAccessToken, refreshAccessToken } from './auth/sessionState';
import { buildApiUrl } from './runtimeConfig';
import type {
  StudyChatCommittedFlashcard,
  StudyChatFlashcardProposal,
  StudyChatHistoryResponse,
  StudyChatModelsResponse,
  StudyChatNewFlashcardProposal,
} from './studyChat/types';

export interface ReviewMutation {
  card_id: string | number;
  success: boolean;
  streak: number;
  last_review_timestamp: string | Date | null;
  client_event_id: string;
}

export interface SubscriptionMutation {
  deck_id: string | number;
}

export interface CreateCurrentUserPayload {
  user_name: string;
  first_name: string;
}

interface DeckRow {
  deck_id: string | number;
  deck_name: string;
  subject: string;
  author?: string | null;
  card_count?: number | null;
}

interface UserRow {
  user_id: number | string;
  user_name: string;
  email?: string | null;
  inscription_date?: string | null;
}

interface SessionRow {
  card_id: string | number;
  recto: string;
  verso: string;
  difficulty?: number | null;
  last_review_timestamp?: string | null;
  streak?: number | null;
  success?: boolean | null;
}

interface AnalyticsChartPointRow {
  x: string | number;
  y: number;
  label?: string | null;
}

interface AnalyticsOverviewRow {
  total_reviews: number;
  correct_reviews: number;
  incorrect_reviews: number;
  known_reviews: number;
  remembered_reviews: number;
  accuracy: number;
  unique_cards_reviewed: number;
  active_days: number;
  current_streak: number;
  longest_streak: number;
}

interface AnalyticsDeckBreakdownRow {
  deck_id: number;
  deck_name: string;
  subject: string;
  total_reviews: number;
  correct_reviews: number;
  incorrect_reviews: number;
  known_reviews: number;
  remembered_reviews: number;
  accuracy: number;
  unique_cards_reviewed: number;
  last_reviewed_at?: string | null;
}

interface AnalyticsRecentActivityRow {
  id: string;
  deck_id: number;
  deck_name: string;
  subject: string;
  activity_date: string;
  total_reviews: number;
  correct_reviews: number;
  incorrect_reviews: number;
  known_reviews: number;
  remembered_reviews: number;
  accuracy: number;
  unique_cards_reviewed: number;
  last_reviewed_at: string;
}

interface AnalyticsDelayBinRow {
  key: string;
  label: string;
  lower_bound_seconds: number;
  upper_bound_seconds: number;
}

interface AnalyticsStreakBucketRow {
  key: string;
  label: string;
  total_reviews: number;
}

interface AnalyticsRecallRatePointRow {
  delay_bin_key: string;
  delay_bin_label: string;
  success_rate?: number | null;
  review_count: number;
  correct_reviews: number;
  incorrect_reviews: number;
}

interface AnalyticsRecallRateSeriesRow {
  streak_bucket_key: string;
  streak_bucket_label: string;
  total_reviews: number;
  points: AnalyticsRecallRatePointRow[];
}

interface AnalyticsRecallRateByDelayRow {
  delay_bins: AnalyticsDelayBinRow[];
  streak_buckets: AnalyticsStreakBucketRow[];
  series: AnalyticsRecallRateSeriesRow[];
  first_review_count: number;
}

interface AnalyticsRow {
  range: AnalyticsRange;
  overview: AnalyticsOverviewRow;
  review_count_trend: AnalyticsChartPointRow[];
  accuracy_trend: AnalyticsChartPointRow[];
  cards_reviewed_trend: AnalyticsChartPointRow[];
  deck_breakdown: AnalyticsDeckBreakdownRow[];
  recent_activity: AnalyticsRecentActivityRow[];
  recall_rate_by_delay?: AnalyticsRecallRateByDelayRow | null;
}

interface StudyChatModelOptionRow {
  id: string;
  label: string;
}

interface StudyChatModelsRow {
  models: StudyChatModelOptionRow[];
  default_model: string;
}

interface StudyChatChartAttachmentRow {
  artifact_id: string;
  title: string;
  summary: string;
  caption: string;
  alt_text: string;
  chart_type: string;
  data_mode: string;
  image_path: string;
  image_data_url: string;
}

interface StudyChatImageAttachmentRow {
  artifact_id: string;
  title: string;
  summary: string;
  caption: string;
  alt_text: string;
  image_path: string;
  image_data_url: string;
}

interface StudyChatHistoryMessageRow {
  message_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  chart_attachments: StudyChatChartAttachmentRow[];
  image_attachments: StudyChatImageAttachmentRow[];
}

interface StudyChatHistoryRow {
  thread_id: number | null;
  messages: StudyChatHistoryMessageRow[];
}

interface StudyChatCommittedFlashcardRow {
  card_id: number;
  deck_id: number;
  recto: string;
  verso: string;
  difficulty: number;
  creation_date: string;
}

export const buildHeaders = async (headers?: HeadersInit) => {
  const nextHeaders = new Headers(headers);
  if (!nextHeaders.has('Content-Type')) {
    nextHeaders.set('Content-Type', 'application/json');
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    nextHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  return nextHeaders;
};

export const parseErrorMessage = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  const errorPayload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (typeof errorPayload?.detail === 'string') {
    return errorPayload.detail;
  }

  if (typeof errorPayload?.message === 'string') {
    return errorPayload.message;
  }

  if (response.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  return `Request failed with status ${response.status}`;
};

const requestJson = async <T>(
  path: string,
  init?: RequestInit,
  allowNotFound = false,
  hasRetried = false,
): Promise<T | null> => {
  const response = await fetch(buildApiUrl(path), {
    headers: await buildHeaders(init?.headers),
    ...init,
  });

  if (allowNotFound && response.status === 404) {
    return null;
  }

  if (response.status === 401 && !hasRetried) {
    const nextAccessToken = await refreshAccessToken();
    if (nextAccessToken) {
      return requestJson<T>(path, init, allowNotFound, true);
    }
  }

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return null;
  }

  return response.json() as Promise<T>;
};

const mapDeckRow = (row: DeckRow): Deck => ({
  deck_id: row.deck_id,
  deck_name: row.deck_name,
  subject: row.subject,
  author: row.author ?? undefined,
  card_count: row.card_count ?? undefined,
});

const mapUserRow = (row: UserRow): User => ({
  user_id: row.user_id,
  user_name: row.user_name,
  email: row.email ?? undefined,
  subscription_date: row.inscription_date ?? undefined,
});

const mapSessionRow = (row: SessionRow): SessionData => ({
  card_id: row.card_id,
  recto: row.recto,
  verso: row.verso,
  difficulty: row.difficulty,
  lastReviewTimestamp: row.last_review_timestamp ?? null,
  streak: row.streak ?? 0,
  success: row.success ?? null,
});

const mapAnalyticsChartPoint = (row: AnalyticsChartPointRow) => ({
  x: row.x,
  y: row.y,
  label: row.label ?? undefined,
});

const mapAnalyticsRecallRatePoint = (row: AnalyticsRecallRatePointRow) => ({
  delayBinKey: row.delay_bin_key,
  delayBinLabel: row.delay_bin_label,
  successRate: row.success_rate ?? null,
  reviewCount: row.review_count,
  correctReviews: row.correct_reviews,
  incorrectReviews: row.incorrect_reviews,
});

const mapAnalyticsRecallRateByDelay = (
  row?: AnalyticsRecallRateByDelayRow | null,
) => {
  if (!row) {
    return {
      delayBins: [],
      streakBuckets: [],
      series: [],
      firstReviewCount: 0,
    };
  }

  return {
    delayBins: row.delay_bins.map((delayBin) => ({
      key: delayBin.key,
      label: delayBin.label,
      lowerBoundSeconds: delayBin.lower_bound_seconds,
      upperBoundSeconds: delayBin.upper_bound_seconds,
    })),
    streakBuckets: row.streak_buckets.map((streakBucket) => ({
      key: streakBucket.key,
      label: streakBucket.label,
      totalReviews: streakBucket.total_reviews,
    })),
    series: row.series.map((series) => ({
      streakBucketKey: series.streak_bucket_key,
      streakBucketLabel: series.streak_bucket_label,
      totalReviews: series.total_reviews,
      points: series.points.map(mapAnalyticsRecallRatePoint),
    })),
    firstReviewCount: row.first_review_count,
  };
};

const mapAnalyticsRow = (row: AnalyticsRow): ProfileAnalytics => ({
  range: row.range,
  overview: {
    totalReviews: row.overview.total_reviews,
    correctReviews: row.overview.correct_reviews,
    incorrectReviews: row.overview.incorrect_reviews,
    knownReviews: row.overview.known_reviews,
    rememberedReviews: row.overview.remembered_reviews,
    accuracy: row.overview.accuracy,
    uniqueCardsReviewed: row.overview.unique_cards_reviewed,
    activeDays: row.overview.active_days,
    currentStreak: row.overview.current_streak,
    longestStreak: row.overview.longest_streak,
  },
  reviewCountTrend: row.review_count_trend.map(mapAnalyticsChartPoint),
  accuracyTrend: row.accuracy_trend.map(mapAnalyticsChartPoint),
  cardsReviewedTrend: row.cards_reviewed_trend.map(mapAnalyticsChartPoint),
  deckBreakdown: row.deck_breakdown.map((deck) => ({
    deckId: deck.deck_id,
    deckName: deck.deck_name,
    subject: deck.subject,
    totalReviews: deck.total_reviews,
    correctReviews: deck.correct_reviews,
    incorrectReviews: deck.incorrect_reviews,
    knownReviews: deck.known_reviews,
    rememberedReviews: deck.remembered_reviews,
    accuracy: deck.accuracy,
    uniqueCardsReviewed: deck.unique_cards_reviewed,
    lastReviewedAt: deck.last_reviewed_at ?? null,
  })),
  recentActivity: row.recent_activity.map((activity) => ({
    id: activity.id,
    deckId: activity.deck_id,
    deckName: activity.deck_name,
    subject: activity.subject,
    activityDate: activity.activity_date,
    totalReviews: activity.total_reviews,
    correctReviews: activity.correct_reviews,
    incorrectReviews: activity.incorrect_reviews,
    knownReviews: activity.known_reviews,
    rememberedReviews: activity.remembered_reviews,
    accuracy: activity.accuracy,
    uniqueCardsReviewed: activity.unique_cards_reviewed,
    lastReviewedAt: activity.last_reviewed_at,
  })),
  recallRateByDelay: mapAnalyticsRecallRateByDelay(row.recall_rate_by_delay),
});

const mapStudyChatModelsRow = (
  row: StudyChatModelsRow,
): StudyChatModelsResponse => ({
  models: row.models.map((model) => ({
    id: model.id,
    label: model.label,
  })),
  defaultModel: row.default_model,
});

export const mapStudyChatChartAttachmentRow = (
  row: StudyChatChartAttachmentRow,
) => ({
  artifactId: row.artifact_id,
  title: row.title,
  summary: row.summary,
  caption: row.caption,
  altText: row.alt_text,
  chartType: row.chart_type,
  dataMode: row.data_mode,
  imagePath: row.image_path,
  imageDataUrl: row.image_data_url || undefined,
});

export const mapStudyChatImageAttachmentRow = (
  row: StudyChatImageAttachmentRow,
) => ({
  artifactId: row.artifact_id,
  title: row.title,
  summary: row.summary,
  caption: row.caption,
  altText: row.alt_text,
  imagePath: row.image_path,
  imageDataUrl: row.image_data_url || undefined,
});

const mapStudyChatHistoryRow = (
  row: StudyChatHistoryRow,
): StudyChatHistoryResponse => ({
  threadId: row.thread_id,
  messages: row.messages.map((message) => ({
    messageId: message.message_id,
    role: message.role,
    content: message.content,
    createdAt: message.created_at,
    chartAttachments: message.chart_attachments.map(
      mapStudyChatChartAttachmentRow,
    ),
    imageAttachments: message.image_attachments.map(
      mapStudyChatImageAttachmentRow,
    ),
  })),
});

const mapStudyChatCommittedFlashcardRow = (
  row: StudyChatCommittedFlashcardRow,
): StudyChatCommittedFlashcard => ({
  cardId: row.card_id,
  deckId: row.deck_id,
  recto: row.recto,
  verso: row.verso,
  difficulty: row.difficulty,
  creationDate: row.creation_date,
});

const buildStudyCardsPath = (deckIds: (string | number)[]) => {
  const queryParams = new URLSearchParams();
  deckIds.forEach((deckId) => {
    queryParams.append('deck_id', `${Number(deckId)}`);
  });
  return `/me/study-cards?${queryParams.toString()}`;
};

export const listDecks = async (): Promise<Deck[]> => {
  const decks = await requestJson<DeckRow[]>('/decks');
  return (decks ?? []).map(mapDeckRow);
};

export const deleteSubscriptionRequest = async (
  subscription: SubscriptionMutation,
) => {
  await requestJson<void>(`/me/subscriptions/${subscription.deck_id}`, {
    method: 'DELETE',
  });
  return subscription;
};

export const getCurrentUserRequest = async (): Promise<User | null> => {
  const user = await requestJson<UserRow>('/me', undefined, true);
  return user ? mapUserRow(user) : null;
};

export const createCurrentUserRequest = async (
  payload: CreateCurrentUserPayload,
): Promise<User> => {
  const user = await requestJson<UserRow>('/me/profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapUserRow(user!);
};

export const deleteCurrentUserAccountRequest = async () => {
  await requestJson<void>('/me/account', {
    method: 'DELETE',
  });
};

export const listCurrentUserDecks = async (): Promise<Deck[]> => {
  const decks = await requestJson<DeckRow[]>('/me/decks');
  return (decks ?? []).map(mapDeckRow);
};

export const getCurrentSessionData = async (
  activeDecksIds: (string | number)[],
): Promise<SessionData[]> => {
  if (activeDecksIds.length === 0) {
    return [];
  }

  const sessionRows = await requestJson<SessionRow[]>(
    buildStudyCardsPath(activeDecksIds),
  );
  return (sessionRows ?? []).map(mapSessionRow);
};

export const getCurrentUserAnalyticsRequest = async (
  range: AnalyticsRange,
  recentLimit = 5,
): Promise<ProfileAnalytics> => {
  const queryParams = new URLSearchParams({
    range,
    recent_limit: `${recentLimit}`,
  });
  const analytics = await requestJson<AnalyticsRow>(
    `/me/analytics?${queryParams.toString()}`,
  );
  return mapAnalyticsRow(analytics!);
};

export const getStudyChatModelsRequest =
  async (): Promise<StudyChatModelsResponse> => {
    const studyChatModels = await requestJson<StudyChatModelsRow>(
      '/me/study-chat/models',
    );
    return mapStudyChatModelsRow(
      studyChatModels ?? { models: [], default_model: '' },
    );
  };

export const getStudyChatImageModelsRequest =
  async (): Promise<StudyChatModelsResponse> => {
    const studyChatModels = await requestJson<StudyChatModelsRow>(
      '/me/study-chat/image-models',
    );
    return mapStudyChatModelsRow(
      studyChatModels ?? { models: [], default_model: '' },
    );
  };

export const getStudyChatHistoryRequest = async (
  cardId: string | number,
): Promise<StudyChatHistoryResponse> => {
  const queryParams = new URLSearchParams({
    card_id: `${Number(cardId)}`,
  });
  const studyChatHistory = await requestJson<StudyChatHistoryRow>(
    `/me/study-chat/history?${queryParams.toString()}`,
  );
  return mapStudyChatHistoryRow(
    studyChatHistory ?? { thread_id: null, messages: [] },
  );
};

export const applyStudyChatCardProposalRequest = async (
  proposal: StudyChatFlashcardProposal,
): Promise<StudyChatCommittedFlashcard> => {
  const flashcard = await requestJson<StudyChatCommittedFlashcardRow>(
    '/me/study-chat/apply-card-proposal',
    {
      method: 'POST',
      body: JSON.stringify({
        proposal: {
          proposal_id: proposal.proposalId,
          card_id: proposal.cardId,
          deck_id: proposal.deckId,
          original_recto: proposal.originalRecto,
          original_verso: proposal.originalVerso,
          original_difficulty: proposal.originalDifficulty,
          proposed_recto: proposal.proposedRecto,
          proposed_verso: proposal.proposedVerso,
          proposed_difficulty: proposal.proposedDifficulty,
          change_goal: proposal.changeGoal,
          rationale: proposal.rationale,
          user_feedback_summary: proposal.userFeedbackSummary,
        },
      }),
    },
  );
  return mapStudyChatCommittedFlashcardRow(flashcard!);
};

export const createStudyChatCardFromProposalRequest = async (
  proposal: StudyChatNewFlashcardProposal,
): Promise<StudyChatCommittedFlashcard> => {
  const flashcard = await requestJson<StudyChatCommittedFlashcardRow>(
    '/me/study-chat/create-card-from-proposal',
    {
      method: 'POST',
      body: JSON.stringify({
        proposal: {
          proposal_id: proposal.proposalId,
          deck_id: proposal.deckId,
          deck_name: proposal.deckName,
          proposed_recto: proposal.proposedRecto,
          proposed_verso: proposal.proposedVerso,
          proposed_difficulty: proposal.proposedDifficulty,
          change_goal: proposal.changeGoal,
          rationale: proposal.rationale,
          user_feedback_summary: proposal.userFeedbackSummary,
        },
      }),
    },
  );
  return mapStudyChatCommittedFlashcardRow(flashcard!);
};

export const createCurrentReviewRequest = async (review: ReviewMutation) => {
  return requestJson('/me/reviews', {
    method: 'POST',
    body: JSON.stringify({
      ...review,
      card_id: Number(review.card_id),
      last_review_timestamp:
        review.last_review_timestamp || new Date().toISOString(),
    }),
  });
};

export const createCurrentSubscriptionRequest = async (
  subscription: SubscriptionMutation,
) => {
  return requestJson('/me/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      deck_id: Number(subscription.deck_id),
    }),
  });
};
