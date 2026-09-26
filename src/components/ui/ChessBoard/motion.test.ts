import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { movedPieces } from './motion';

const fenAfter = (fen: string, uci: string) => {
  const c = new Chess(fen);
  c.move(uci);
  return c.fen();
};

describe('movedPieces', () => {
  it('slides the piece that moved, and back', () => {
    const start = new Chess().fen();
    const e4 = fenAfter(start, 'e2e4');
    expect(movedPieces(start, e4)).toEqual([{ from: 'e2', to: 'e4' }]);
    expect(movedPieces(e4, start)).toEqual([{ from: 'e4', to: 'e2' }]);
  });

  it('slides king and rook when castling', () => {
    const fen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
    expect(movedPieces(fen, fenAfter(fen, 'e1g1'))).toEqual(
      expect.arrayContaining([
        { from: 'e1', to: 'g1' },
        { from: 'h1', to: 'f1' },
      ]),
    );
  });

  it('slides the capturing piece and the pawn that promotes', () => {
    const capture = 'k7/8/8/3p4/4P3/8/8/K7 w - - 0 1';
    expect(movedPieces(capture, fenAfter(capture, 'e4d5'))).toEqual([
      { from: 'e4', to: 'd5' },
    ]);
    const promote = 'k7/4P3/8/8/8/8/8/K7 w - - 0 1';
    expect(movedPieces(promote, fenAfter(promote, 'e7e8q'))).toEqual([
      { from: 'e7', to: 'e8' },
    ]);
  });
});
