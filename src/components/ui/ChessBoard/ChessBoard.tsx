import useReducedMotion from '@/hooks/useReducedMotion';
import { triggerHaptic } from '@/utils/haptics';
import { Chess, type Color, type Square } from 'chess.js';
import {
  type ReactElement,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Svg, { G, Line, Polygon, SvgXml } from 'react-native-svg';
import { movedPieces, placement } from './motion';
import { PIECES, type PieceKey } from './pieces';

// ponytail: Book Move's board (tap to move, promotion picker, arrows, sliding pieces, badges, shake, flash) on RN Animated

const FILES = 'abcdefgh';
const SQUARES = [...'12345678'].flatMap((r) =>
  [...FILES].map((f) => `${f}${r}` as Square),
);
const SLIDE_MS = 200;
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

/** A round label on a square's top-right corner, chess.com Game Review style ("??", "★"). */
export interface Badge {
  square: Square;
  glyph: string;
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
  badges?: Badge[];
  /** Change the value to shake the board. */
  shakeKey?: number;
  /** Square flashed once in `flashColor` when it is set. */
  flashSquare?: Square;
  flashColor?: string;
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

/** Scales its content in from 60% when it mounts: remount it (new key) to pop again. */
export function PopIn({
  style,
  children,
}: {
  style?: ViewStyle;
  children: ReactNode;
}) {
  const [scale] = useState(() => new Animated.Value(0.6));
  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 160,
      useNativeDriver: true,
    }).start();
  }, [scale]);
  return (
    <Animated.View
      pointerEvents="none"
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </Animated.View>
  );
}

/** Tap-to-select, tap-to-move chess board whose pieces slide to their new squares. */
export function ChessBoard({
  fen,
  orientation,
  size,
  lastMove,
  interactive,
  onMove,
  arrows,
  badges,
  shakeKey,
  flashSquare,
  flashColor = '#ca3431',
}: ChessBoardProps) {
  const reduceMotion = useReducedMotion();
  const sq = size / 8;
  const chess = useMemo(() => new Chess(fen), [fen]);
  const pieces = useMemo(() => [...placement(fen)], [fen]);
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

  // A piece that arrived from elsewhere starts offset by the distance travelled and slides home.
  const prevFen = useRef(fen);
  const [xy] = useState(
    () => new Map(SQUARES.map((s) => [s, new Animated.ValueXY()] as const)),
  );
  useLayoutEffect(() => {
    for (const v of xy.values()) {
      v.stopAnimation();
      v.setValue({ x: 0, y: 0 });
    }
    const moves =
      prevFen.current === fen || reduceMotion
        ? []
        : movedPieces(prevFen.current, fen);
    prevFen.current = fen;
    Animated.parallel(
      moves.map(({ from, to }) => {
        const v = xy.get(to)!;
        const a = centre(from, orientation, sq);
        const b = centre(to, orientation, sq);
        v.setValue({ x: a.x - b.x, y: a.y - b.y });
        return Animated.timing(v, {
          toValue: { x: 0, y: 0 },
          duration: SLIDE_MS,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        });
      }),
    ).start();
  }, [fen, orientation, sq, xy, reduceMotion]);

  const [shake] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!shakeKey || reduceMotion) return;
    Animated.sequence(
      [6, -6, 6, -6, 6, 0].map((x) =>
        Animated.timing(shake, {
          toValue: x,
          duration: 50,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [shakeKey, shake, reduceMotion]);

  const [flash] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!flashSquare) return;
    flash.setValue(0.7);
    Animated.timing(flash, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [flashSquare, flash]);

  const play = (from: Square, to: Square, promo?: Promotion) => {
    triggerHaptic('impact');
    onMove?.(from, to, promo);
  };

  const tap = (square: Square) => {
    if (!interactive) return;
    const target = targets.find((t) => t.to === square);
    if (selected && target) {
      if (target.promotion) setPromotion({ from: selected, to: square });
      else play(selected, square);
      setSelection(null);
      return;
    }
    const piece = chess.get(square);
    const pick = piece && piece.color === chess.turn() ? square : null;
    if (pick && pick !== selected) triggerHaptic('selection');
    setSelection(pick);
  };

  const squares: ReactElement[] = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const file = orientation === 'w' ? f : 7 - f;
      const rank = orientation === 'w' ? 7 - r : r;
      const square = `${FILES[file]}${rank + 1}` as Square;
      const dark = (file + rank) % 2 === 0;
      const piece = chess.get(square);
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
          {flashSquare === square && (
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: flashColor, opacity: flash },
              ]}
            />
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
        </Pressable>,
      );
    }
  }

  const corner = (square: Square) => {
    const c = centre(square, orientation, sq);
    return { left: c.x - sq / 2, top: c.y - sq / 2 };
  };

  return (
    <Animated.View
      style={{ width: size, height: size, transform: [{ translateX: shake }] }}
    >
      <View style={styles.grid}>{squares}</View>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {pieces.map(([square, key]) => (
          <Animated.View
            key={square}
            style={[
              styles.layer,
              corner(square),
              {
                width: sq,
                height: sq,
                zIndex: lastMove?.to === square ? 2 : 1,
                transform: xy.get(square)!.getTranslateTransform(),
              },
            ]}
          >
            <Piece piece={key} size={sq} />
          </Animated.View>
        ))}
        {targets.map((t) => {
          const c = centre(t.to, orientation, sq);
          const d = t.captured ? sq : sq / 3;
          return (
            <View
              key={t.to}
              style={[
                styles.layer,
                t.captured ? styles.ring : styles.dot,
                {
                  left: c.x - d / 2,
                  top: c.y - d / 2,
                  width: d,
                  height: d,
                  borderRadius: d / 2,
                },
              ]}
            />
          );
        })}
      </View>
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
      {badges?.map((b) => {
        const c = centre(b.square, orientation, sq);
        const d = sq * 0.46;
        // centred on the square's top-right corner, clamped inside the board
        const left = Math.min(Math.max(c.x + sq * 0.4 - d / 2, 0), size - d);
        const top = Math.min(Math.max(c.y - sq * 0.4 - d / 2, 0), size - d);
        return (
          <PopIn
            key={`${b.square}${b.glyph}`}
            style={{
              ...styles.badge,
              left,
              top,
              width: d,
              height: d,
              borderRadius: d / 2,
              backgroundColor: b.color,
            }}
          >
            <Text style={[styles.badgeText, { fontSize: d * 0.5 }]}>
              {b.glyph}
            </Text>
          </PopIn>
        );
      })}
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
                  play(promotion.from, promotion.to, t);
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  layer: { position: 'absolute' },
  highlight: { backgroundColor: COLORS.highlight },
  selected: { backgroundColor: COLORS.selected },
  check: { backgroundColor: COLORS.check },
  coord: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  dot: { backgroundColor: COLORS.hint },
  ring: { borderWidth: 5, borderColor: COLORS.hint },
  badge: {
    position: 'absolute',
    zIndex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  badgeText: { color: '#FFFFFF', fontWeight: '800' },
  promoBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
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
