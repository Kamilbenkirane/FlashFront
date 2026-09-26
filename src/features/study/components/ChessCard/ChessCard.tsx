import { Button } from '@/components/ui/Button';
import {
  type Badge,
  ChessBoard,
  PopIn,
  type Promotion,
} from '@/components/ui/ChessBoard';
import { Typography } from '@/components/ui/Typography';
import {
  BADGE,
  type ChessCardData,
  applyMove,
  outcomeFor,
} from '@/features/study/chessCard';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import { playSound, preloadSounds } from '@/utils/sounds';
import type { Square } from 'chess.js';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

const GREEN = '#15781B'; // lichess arrow brush

// idle: your move → moved: the piece slides → verdict: badge, sound, haptic → pass: next card after a beat;
// fail: revert (the piece slides back) → correction: the best move plays itself, Next waits for you.
type Phase = 'idle' | 'moved' | 'verdict' | 'revert' | 'correction';

interface ChessCardProps {
  card: ChessCardData;
  disabled: boolean;
  /** Chess cards passed in a row this session, before this one. */
  combo: number;
  onPass: () => void;
  onFail: () => void;
}

const squares = (uci: string) => ({
  from: uci.slice(0, 2) as Square,
  to: uci.slice(2, 4) as Square,
});
const after = (ms: number, fn: () => void) => {
  const id = setTimeout(fn, ms);
  return () => clearTimeout(id);
};

/**
 * "Find the move": you play one move on the board and the card's precomputed engine labels grade it. A pass moves on
 * by itself (the Remembered review); a fail shows the best move and waits for Next (the Forgotten review).
 */
export function ChessCard({
  card,
  disabled,
  combo,
  onPass,
  onFail,
}: ChessCardProps) {
  const [size, setSize] = useState(0);
  const [played, setPlayed] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  useEffect(preloadSounds, []);

  const toMove = card.fen.split(' ')[1] === 'b' ? 'b' : 'w';
  const passed = played !== null && outcomeFor(card, played) === 'remembered';
  const label = played ? BADGE[card.moves[played]] : undefined;
  const best = applyMove(card.fen, card.best);
  const mine = played ? applyMove(card.fen, played) : null;
  const judged = phase !== 'idle' && phase !== 'moved';
  const shownCombo = !judged ? combo : passed ? combo + 1 : 0;

  useEffect(() => {
    if (phase === 'moved')
      return after(200, () => {
        if (passed) {
          triggerHaptic('success');
          playSound('correct');
          if ((combo + 1) % 5 === 0)
            setTimeout(() => triggerHaptic('success'), 150);
        } else {
          triggerHaptic('error');
          playSound('wrong');
        }
        setPhase('verdict');
      });
    if (phase === 'verdict')
      return passed
        ? after(1200, onPass)
        : after(700, () => setPhase('revert'));
    if (phase === 'revert')
      return after(350, () => {
        playSound(best.capture ? 'capture' : 'move');
        setPhase('correction');
      });
    return undefined;
  }, [phase]);

  const view = {
    idle: { fen: card.fen, last: card.lastMove },
    moved: { fen: mine?.fen, last: played },
    verdict: { fen: mine?.fen, last: played },
    revert: { fen: card.fen, last: card.lastMove },
    correction: { fen: best.fen, last: card.best },
  }[phase];
  const badges: Badge[] =
    phase === 'verdict' && played && label
      ? [{ square: squares(played).to, ...label }]
      : phase === 'correction'
        ? [{ square: squares(card.best).to, ...BADGE.best }]
        : [];
  const wrong = phase === 'verdict' && !passed && played;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="heading3">
          {toMove === 'w' ? 'White' : 'Black'} to play
        </Typography>
        {shownCombo > 0 ? (
          <PopIn
            key={shownCombo}
            style={{
              ...styles.combo,
              ...(shownCombo % 5 === 0 ? styles.comboMilestone : null),
            }}
          >
            <Typography variant="caption">🔥 {shownCombo} in a row</Typography>
          </PopIn>
        ) : null}
      </View>
      <View
        style={styles.board}
        onLayout={(e) =>
          setSize(Math.floor(e.nativeEvent.layout.width / 8) * 8)
        }
      >
        {size > 0 && (
          <ChessBoard
            fen={view.fen ?? card.fen}
            orientation={toMove}
            size={size}
            lastMove={view.last ? squares(view.last) : undefined}
            interactive={phase === 'idle' && !disabled}
            onMove={(from: Square, to: Square, promotion?: Promotion) => {
              const uci = `${from}${to}${promotion ?? ''}`;
              playSound(applyMove(card.fen, uci).capture ? 'capture' : 'move');
              setPlayed(uci);
              setPhase('moved');
            }}
            arrows={
              phase === 'correction'
                ? [{ ...squares(card.best), color: GREEN }]
                : undefined
            }
            badges={badges}
            shakeKey={wrong ? 1 : undefined}
            flashSquare={wrong ? squares(wrong).to : undefined}
          />
        )}
      </View>
      <View style={styles.result}>
        {judged && label ? (
          <PopIn style={styles.verdict}>
            <View style={[styles.dot, { backgroundColor: label.color }]}>
              <Typography variant="caption" style={styles.dotGlyph}>
                {label.glyph}
              </Typography>
            </View>
            <View>
              <Typography
                variant="heading3"
                color={passed ? 'success' : 'error'}
                accessibilityLiveRegion="polite"
              >
                {played === card.best ? BADGE.best.name : label.name}
              </Typography>
              {played !== card.best ? (
                <Typography variant="small" color="muted">
                  Best was {best.san}
                </Typography>
              ) : null}
            </View>
          </PopIn>
        ) : null}
        {judged && !passed ? (
          <Button
            title="Next"
            size="lg"
            fullWidth
            disabled={disabled || phase !== 'correction'}
            onPress={onFail}
            testID="chess-card-next"
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  combo: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.muted,
  },
  comboMilestone: { backgroundColor: theme.colors.gold },
  board: { width: '100%', alignItems: 'center' },
  result: { gap: 16, minHeight: 124 },
  verdict: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotGlyph: { color: '#FFFFFF', fontWeight: '800' },
});
