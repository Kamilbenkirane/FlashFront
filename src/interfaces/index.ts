// Central interface exports
export * from './IFlashcard';
export * from './StudySession';

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
