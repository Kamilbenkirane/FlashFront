import { describe, expect, it } from 'vitest';
import { outcomeFor, parseChessCard } from './chessCard';

const recto = JSON.stringify({
  type: 'chess',
  fen: 'rnbqk1nr/pppp1ppp/8/2b1p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 1',
  lastMove: 'd1h5',
});
const verso = JSON.stringify({
  best: 'd8e7',
  moves: {
    d8e7: 'best',
    d8f6: 'good',
    g7g6: 'blunder',
    g8h6: 'mistake',
    b8c6: 'book',
    a7a6: 'excellent',
    h7h6: 'inaccuracy',
    f7f6: 'miss',
    e7e8q: 'best',
  },
});

describe('chess cards', () => {
  it('parses a chess card', () => {
    expect(parseChessCard(recto, verso)).toMatchObject({
      fen: expect.stringContaining(' b KQkq'),
      lastMove: 'd1h5',
      best: 'd8e7',
    });
  });

  it('leaves text cards alone', () => {
    expect(parseChessCard('What is 2 + 2?', '4')).toBeNull();
    expect(parseChessCard('{not json', '4')).toBeNull();
    expect(parseChessCard('{"type":"note"}', '{}')).toBeNull();
  });

  it('grades a move by its engine label', () => {
    const card = parseChessCard(recto, verso)!;
    for (const uci of ['d8e7', 'd8f6', 'b8c6', 'a7a6'])
      expect(outcomeFor(card, uci)).toBe('remembered');
    for (const uci of ['g7g6', 'g8h6', 'h7h6', 'f7f6'])
      expect(outcomeFor(card, uci)).toBe('forgotten');
    expect(outcomeFor(card, 'a2a4')).toBe('forgotten');
  });

  it('keeps the promotion piece in the move', () => {
    const card = parseChessCard(recto, verso)!;
    expect(outcomeFor(card, 'e7e8q')).toBe('remembered');
    expect(outcomeFor(card, 'e7e8n')).toBe('forgotten');
  });
});
