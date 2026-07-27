// Central interface exports

// Re-export User from UserContext to avoid conflicts
export type { User } from '../context/UserContext';
import type { User } from '../context/UserContext';

export interface Deck {
  deck_id: string | number;
  deck_name: string;
  subject: string;
  card_count?: number;
  difficulty?: string;
}

/**
 * A single card, in both its raw API form and its parsed `Flashcard` model form.
 * `lastReviewTimestamp` arrives as a string over the wire and is parsed to a
 * `Date` by the `Flashcard` constructor; `secondsSinceLastReview` is derived by
 * the model and absent on raw payloads.
 */
export interface SessionData {
  card_id: string;
  recto: string;
  verso: string;
  lastReviewTimestamp?: string | Date | null;
  streak: number;
  success?: boolean | null;
  difficulty: number;
  malus: number;
  popupScore: number;
  probability?: number;
  secondsSinceLastReview?: number;
}

// Import Session class for proper typing
import type Session from '../models/Session';

// Hook types
export interface UseSessionHookType {
  session: Session | null;
  loading?: boolean;
  error?: string | null;
}

// Component prop types
export interface UsersDropdownProps {
  users: User[];
  onSelectUser: (user: User | null) => void;
}

export interface DecksMultiSelectProps {
  decks: Deck[];
  onSelectDecks: (deckIds: (string | number)[]) => void;
}

export interface DeckComponentProps {
  deck: Deck;
  decks: Deck[];
  onSelectDecks?: (deckIds: (string | number)[]) => void;
}
