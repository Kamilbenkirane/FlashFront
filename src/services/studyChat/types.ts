export const STUDY_CHAT_DEFAULT_MODEL_ID = 'gemini-3-flash-preview';
export const STUDY_CHAT_DEFAULT_IMAGE_MODEL_ID =
  'gemini-3.1-flash-image-preview';
export const STUDY_CHAT_BACKEND_KEY_MESSAGE =
  'Study chat needs one backend provider key in flashcard-learning-system/.env: OPENAI_API_KEY, GOOGLE_API_KEY, or ANTHROPIC_API_KEY.';
export const STUDY_CHAT_IMAGE_BACKEND_KEY_MESSAGE =
  'Study chat image generation needs one backend provider key in flashcard-learning-system/.env: GOOGLE_API_KEY or BYTEPLUS_API_KEY.';

export interface StudyChatModelOption {
  id: string;
  label: string;
}

export interface StudyChatModelsResponse {
  models: StudyChatModelOption[];
  defaultModel: string;
}

export interface StudyChatRequestMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StudyChatChartAttachment {
  artifactId: string;
  title: string;
  summary: string;
  caption: string;
  altText: string;
  chartType: string;
  dataMode: string;
  imagePath: string;
  imageDataUrl?: string;
}

export interface StudyChatImageAttachment {
  artifactId: string;
  title: string;
  summary: string;
  caption: string;
  altText: string;
  imagePath: string;
  imageDataUrl?: string;
}

export interface StudyChatFlashcardProposal {
  proposalId: string;
  cardId: number;
  deckId: number;
  originalRecto: string;
  originalVerso: string;
  originalDifficulty: number;
  proposedRecto: string;
  proposedVerso: string;
  proposedDifficulty: number;
  changeGoal: string;
  rationale: string;
  userFeedbackSummary: string;
}

export interface StudyChatNewFlashcardProposal {
  proposalId: string;
  deckId: number;
  deckName: string;
  proposedRecto: string;
  proposedVerso: string;
  proposedDifficulty: number;
  changeGoal: string;
  rationale: string;
  userFeedbackSummary: string;
}

export interface StudyChatCommittedFlashcard {
  cardId: number;
  deckId: number;
  recto: string;
  verso: string;
  difficulty: number;
  creationDate: string;
}

type StudyChatProposalActionStatus =
  | 'idle'
  | 'submitting'
  | 'success'
  | 'error';

export interface StudyChatProposalActionState {
  isEditing: boolean;
  status: StudyChatProposalActionStatus;
  errorMessage: string | null;
  proposedRecto: string;
  proposedVerso: string;
  proposedDifficulty: string;
}

export interface StudyChatHistoryMessage {
  messageId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  chartAttachments: StudyChatChartAttachment[];
  imageAttachments: StudyChatImageAttachment[];
}

export interface StudyChatHistoryResponse {
  threadId: number | null;
  messages: StudyChatHistoryMessage[];
}

export interface StudyChatStreamEvent {
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
  statusLabel?: string;
  chart?: StudyChatChartAttachment;
  image?: StudyChatImageAttachment;
  proposal?: StudyChatFlashcardProposal;
  newFlashcardProposal?: StudyChatNewFlashcardProposal;
  message?: string;
}

export interface StudyChatUiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  attachments?: StudyChatChartAttachment[];
  imageAttachments?: StudyChatImageAttachment[];
  proposals?: StudyChatFlashcardProposal[];
  newFlashcardProposals?: StudyChatNewFlashcardProposal[];
  toolStatus?: string | null;
  status?: 'streaming' | 'done' | 'error';
}
