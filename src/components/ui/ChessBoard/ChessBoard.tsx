import { Chess, type Color, type Square } from 'chess.js';
import { type ReactElement, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Line, Polygon, SvgXml } from 'react-native-svg';
import { PIECES, type PieceKey } from './pieces';

// ponytail: Book Move's board (tap to move, promotion picker, arrows) without its slide animation, shake, flash and badges

const FILES = 'abcdefgh';
const NAMES: Record<string, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
};
// chess.com's green board
const COLORS = {
  light: '#EBECD0',
  dark: '#739552',
  highlight: 'rgba(255,255,51,0.5)',
  selected: 'rgba(20,85,30,0.5)',
  hint: 'rgba(0,0,0,0.22)',
  check: 'rgba(255,0,0,0.55)',
};

export type Promotion = 'q' | 'r' | 'b' | 'n';

export interface Arrow {
  from: Square;
  to: Square;
  color: string;
}

interface ChessBoardProps {
  fen: string;
  orientation: Color;
  /** Board side in points (a multiple of 8 keeps squares crisp). */
  size: number;
  lastMove?: { from: string; to: string };
  interactive: boolean;
  onMove?: (from: Square, to: Square, promotion?: Promotion) => void;
  arrows?: Arrow[];
}

/** Centre of a square for the given orientation and square size. */
const centre = (square: Square, orientation: Color, sq: number) => {
  const file = FILES.indexOf(square[0]);
  const rank = Number(square[1]) - 1;
  return orientation === 'w'
    ? { x: (file + 0.5) * sq, y: (7.5 - rank) * sq }
    : { x: (7.5 - file) * sq, y: (rank + 0.5) * sq };
};

const Piece = ({ piece, size }: { piece: PieceKey; size: number }) => (
  <SvgXml xml={PIECES[piece]} width={size} height={size} />
);

/** Tap-to-select, tap-to-move chess board. */
export function ChessBoard({
  fen,
  orientation,
  size,
  lastMove,
  interactive,
  onMove,
  arrows,
}: ChessBoardProps) {
  const sq = size / 8;
  const chess = useMemo(() => new Chess(fen), [fen]);
  const [selection, setSelection] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const selected = interactive ? selection : null;
  const targets = selected
    ? chess
        .moves({ square: selected, verbose: true })
        .filter((m, i, all) => all.findIndex((u) => u.to === m.to) === i) // four promotion moves share a square
    : [];
  const checked = chess.inCheck()
    ? (chess.findPiece({ type: 'k', color: chess.turn() })[0] ?? null)
    : null;

  const tap = (square: Square) => {
    if (!interactive) return;
    const target = targets.find((t) => t.to === square);
    if (selected && target) {
      if (target.promotion) setPromotion({ from: selected, to: square });
      else onMove?.(selected, square);
      setSelection(null);
      return;
    }
    const piece = chess.get(square);
    setSelection(piece && piece.color === chess.turn() ? square : null);
  };

  const squares: ReactElement[] = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const file = orientation === 'w' ? f : 7 - f;
      const rank = orientation === 'w' ? 7 - r : r;
      const square = `${FILES[file]}${rank + 1}` as Square;
      const dark = (file + rank) % 2 === 0;
      const piece = chess.get(square);
      const target = targets.find((t) => t.to === square);
      const coordColor = dark ? COLORS.light : COLORS.dark;
      squares.push(
        <Pressable
          key={square}
          onPress={() => tap(square)}
          accessibilityRole="button"
          accessibilityLabel={
            piece
              ? `${square}, ${piece.color === 'w' ? 'white' : 'black'} ${NAMES[piece.type]}`
              : square
          }
          style={{
            width: sq,
            height: sq,
            backgroundColor: dark ? COLORS.dark : COLORS.light,
          }}
        >
          {(lastMove?.from === square || lastMove?.to === square) && (
            <View style={[StyleSheet.absoluteFill, styles.highlight]} />
          )}
          {selected === square && (
            <View style={[StyleSheet.absoluteFill, styles.selected]} />
          )}
          {checked === square && (
            <View style={[StyleSheet.absoluteFill, styles.check]} />
          )}
          {f === 0 && (
            <Text
              style={[styles.coord, { color: coordColor, top: 1, left: 2 }]}
            >
              {rank + 1}
            </Text>
          )}
          {r === 7 && (
            <Text
              style={[styles.coord, { color: coordColor, bottom: 0, right: 2 }]}
            >
              {FILES[file]}
            </Text>
          )}
          {piece && (
            <View pointerEvents="none">
              <Piece
                piece={`${piece.color}${piece.type.toUpperCase()}` as PieceKey}
                size={sq}
              />
            </View>
          )}
          {target &&
            (target.captured ? (
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  styles.ring,
                  { borderRadius: sq / 2 },
                ]}
              />
            ) : (
              <View
                pointerEvents="none"
                style={[
                  styles.dot,
                  {
                    width: sq / 3,
                    height: sq / 3,
                    borderRadius: sq / 6,
                    left: sq / 3,
                    top: sq / 3,
                  },
                ]}
              />
            ))}
        </Pressable>,
      );
    }
  }

  return (
    <View style={{ width: size, height: size }}>
      <View style={styles.grid}>{squares}</View>
      {arrows?.length ? (
        <Svg
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          width={size}
          height={size}
        >
          <G opacity={0.8}>
            {arrows.map((a) => {
              // chessground geometry: stroke 10/64 of a square, rounded caps, 3x4 head in stroke units, tip pulled back
              const c1 = centre(a.from, orientation, sq);
              const c2 = centre(a.to, orientation, sq);
              const len = Math.hypot(c2.x - c1.x, c2.y - c1.y) || 1;
              const ux = (c2.x - c1.x) / len;
              const uy = (c2.y - c1.y) / len;
              const w = (10 / 64) * sq;
              const end = { x: c2.x - ux * w, y: c2.y - uy * w };
              const tip = {
                x: end.x + ux * 0.95 * w,
                y: end.y + uy * 0.95 * w,
              };
              const base = {
                x: end.x - ux * 2.05 * w,
                y: end.y - uy * 2.05 * w,
              };
              return (
                <G key={`${a.from}${a.to}`}>
                  <Line
                    x1={c1.x}
                    y1={c1.y}
                    x2={end.x - ux * 2 * w}
                    y2={end.y - uy * 2 * w}
                    stroke={a.color}
                    strokeWidth={w}
                    strokeLinecap="round"
                  />
                  <Polygon
                    points={`${tip.x},${tip.y} ${base.x - uy * 2 * w},${base.y + ux * 2 * w} ${base.x + uy * 2 * w},${base.y - ux * 2 * w}`}
                    fill={a.color}
                  />
                </G>
              );
            })}
          </G>
        </Svg>
      ) : null}
      {interactive && promotion && (
        <Pressable
          style={[StyleSheet.absoluteFill, styles.promoBackdrop]}
          onPress={() => setPromotion(null)}
          accessibilityLabel="Cancel promotion"
        >
          <View style={styles.promoRow}>
            {(['q', 'r', 'b', 'n'] as const).map((t) => (
              <Pressable
                key={t}
                style={styles.promoButton}
                accessibilityRole="button"
                accessibilityLabel={`Promote to ${NAMES[t]}`}
                onPress={() => {
                  onMove?.(promotion.from, promotion.to, t);
                  setPromotion(null);
                }}
              >
                <Piece
                  piece={`${chess.turn()}${t.toUpperCase()}` as PieceKey}
                  size={sq}
                />
              </Pressable>
            ))}
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  highlight: { backgroundColor: COLORS.highlight },
  selected: { backgroundColor: COLORS.selected },
  check: { backgroundColor: COLORS.check },
  coord: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  dot: { position: 'absolute', backgroundColor: COLORS.hint },
  ring: { borderWidth: 5, borderColor: COLORS.hint },
  promoBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.light,
    borderRadius: 8,
    padding: 6,
    gap: 6,
  },
  promoButton: { backgroundColor: COLORS.dark, borderRadius: 6 },
});
