import type { Square } from 'chess.js';
import type { PieceKey } from './pieces';

// Ported from Book Move src/chess/animate.ts: which pieces travelled between two positions, so the board can slide them.

const FILES = 'abcdefgh';

/** Square -> piece key ("wK"), from the placement field of a FEN. */
export function placement(fen: string): Map<Square, PieceKey> {
  const out = new Map<Square, PieceKey>();
  fen
    .split(' ')[0]
    .split('/')
    .forEach((row, r) => {
      let f = 0;
      for (const c of row) {
        if (c >= '1' && c <= '8') f += Number(c);
        else {
          const color = c === c.toUpperCase() ? 'w' : 'b';
          out.set(
            `${FILES[f]}${8 - r}` as Square,
            `${color}${c.toUpperCase()}` as PieceKey,
          );
          f++;
        }
      }
    });
  return out;
}

/**
 * Pieces that travelled between two positions, paired greedily by piece key: a square vacated in `before` and a square
 * newly holding the same piece in `after`. Castling yields two pairs, a promotion pairs the pawn with the new piece,
 * a captured piece just vanishes.
 */
export function movedPieces(
  fenBefore: string,
  fenAfter: string,
): { from: Square; to: Square }[] {
  const a = placement(fenBefore);
  const b = placement(fenAfter);
  const vacated: { square: Square; key: PieceKey }[] = [];
  const arrived: { square: Square; key: PieceKey }[] = [];
  for (const [square, key] of a)
    if (b.get(square) !== key) vacated.push({ square, key });
  for (const [square, key] of b)
    if (a.get(square) !== key) arrived.push({ square, key });
  const moves: { from: Square; to: Square }[] = [];
  for (const dst of arrived) {
    let i = vacated.findIndex((v) => v.key === dst.key);
    if (i < 0)
      i = vacated.findIndex((v) => v.key[0] === dst.key[0] && v.key[1] === 'P'); // promotion: pawn became this piece
    if (i < 0) continue;
    moves.push({ from: vacated[i].square, to: dst.square });
    vacated.splice(i, 1);
  }
  return moves;
}
