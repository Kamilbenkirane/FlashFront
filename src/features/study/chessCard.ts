import type { StudyReviewOutcome } from '@/domain/study/models/Flashcard';
import { Chess } from 'chess.js';

// A chess card is a normal flashcard whose recto/verso hold JSON (exported by Book Move's scripts/export-decks.ts):
//   recto: {"type":"chess","fen":"<you to move>","lastMove":"<uci>"}
//   verso: {"best":"<uci>","moves":{"<uci>":"<engine label>", ...}}  (every legal move)
// Cards carry no deck id, so a card is recognised by its content.

export interface ChessCardData {
  fen: string;
  lastMove?: string;
  best: string;
  moves: Record<string, string>;
}

/** Engine labels that count as knowing the position; anything else (inaccuracy, mistake, miss, blunder) is forgotten. */
const PASSING = new Set(['book', 'best', 'excellent', 'good']);

/** chess.com Game Review badges: glyph and colour per engine label. */
export const BADGE: Record<
  string,
  { name: string; glyph: string; color: string }
> = {
  book: { name: 'Book move', glyph: '📖', color: '#a88865' },
  best: { name: 'Best move', glyph: '★', color: '#96bc4b' },
  excellent: { name: 'Excellent', glyph: '!', color: '#96bc4b' },
  good: { name: 'Good', glyph: '✓', color: '#96af8b' },
  inaccuracy: { name: 'Inaccuracy', glyph: '?!', color: '#f0c15c' },
  mistake: { name: 'Mistake', glyph: '?', color: '#e6912c' },
  miss: { name: 'Miss', glyph: '?', color: '#ee6b55' },
  blunder: { name: 'Blunder', glyph: '??', color: '#ca3431' },
};

/** Plays a uci move from a position: the position after it, its SAN, and whether it captures. */
export function applyMove(fen: string, uci: string) {
  const chess = new Chess(fen);
  const move = chess.move(uci);
  return { fen: chess.fen(), san: move.san, capture: Boolean(move.captured) };
}

export function parseChessCard(
  recto: string,
  verso: string,
): ChessCardData | null {
  try {
    const front = JSON.parse(recto);
    const back = JSON.parse(verso);
    if (
      front?.type !== 'chess' ||
      typeof front.fen !== 'string' ||
      typeof back?.best !== 'string' ||
      typeof back.moves !== 'object'
    )
      return null;
    return { ...back, fen: front.fen, lastMove: front.lastMove };
  } catch {
    return null;
  }
}

/** The review a played move (uci, e.g. "e7e8q") submits; a move the card does not know counts as forgotten. */
export const outcomeFor = (
  card: ChessCardData,
  uci: string,
): StudyReviewOutcome =>
  PASSING.has(card.moves[uci]) ? 'remembered' : 'forgotten';
