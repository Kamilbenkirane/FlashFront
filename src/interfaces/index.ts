// Central interface exports
export * from './Analytics';

export type { User } from '@/providers/UserProvider';

export interface Deck {
  deck_id: string | number;
  deck_name: string;
  subject: string;
  author?: string;
  card_count?: number;
}

export interface SessionData {
  card_id: string | number;
  recto: string;
  verso: string;
  difficulty?: number | null;
  lastReviewTimestamp?: string | Date | null;
  streak?: number | null;
  success?: boolean | null;
  probability?: number;
}

export interface DecksMultiSelectProps {
  decks: Deck[];
  onSelectDecks: (deckIds: (string | number)[]) => void;
  selectedDeckIds: (string | number)[];
}
