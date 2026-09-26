import { Button } from '@/components/ui/Button';
import {
  type Arrow,
  ChessBoard,
  type Promotion,
} from '@/components/ui/ChessBoard';
import { Typography } from '@/components/ui/Typography';
import { type ChessCardData, outcomeFor } from '@/features/study/chessCard';
import { Chess, type Square } from 'chess.js';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

// lichess arrow brushes
const GREEN = '#15781B';
const BLUE = '#003088';
const RED = '#882020';

interface ChessCardProps {
  card: ChessCardData;
  disabled: boolean;
  onRemembered: () => void;
  onForgotten: () => void;
}

const squares = (uci: string) => ({
  from: uci.slice(0, 2) as Square,
  to: uci.slice(2, 4) as Square,
});

/**
 * "Find the move": you play one move on the board, the card's precomputed engine labels grade it, and Next submits
 * the review the Forgotten / Remembered buttons would.
 */
export function ChessCard({
  card,
  disabled,
  onRemembered,
  onForgotten,
}: ChessCardProps) {
  const [size, setSize] = useState(0);
  const [played, setPlayed] = useState<string | null>(null);
  const toMove = card.fen.split(' ')[1] === 'b' ? 'b' : 'w';
  const outcome = played ? outcomeFor(card, played) : null;
  const passed = outcome === 'remembered';

  const arrows: Arrow[] = [];
  if (played) {
    if (played !== card.best)
      arrows.push({ ...squares(played), color: passed ? BLUE : RED });
    arrows.push({ ...squares(card.best), color: GREEN });
  }
  const bestSan = new Chess(card.fen).move(card.best).san;
  const label = played ? card.moves[played] : '';
  const verdict = played
    ? played === card.best
      ? 'Best move'
      : `${label[0].toUpperCase()}${label.slice(1)} · best was ${bestSan}`
    : null;
  const shown = played ?? card.lastMove;

  return (
    <View style={styles.container}>
      <Typography variant="heading3" style={styles.prompt}>
        {toMove === 'w' ? 'White' : 'Black'} to play
      </Typography>
      <View
        style={styles.board}
        onLayout={(e) =>
          setSize(Math.floor(e.nativeEvent.layout.width / 8) * 8)
        }
      >
        {size > 0 && (
          <ChessBoard
            fen={card.fen}
            orientation={toMove}
            size={size}
            lastMove={shown ? squares(shown) : undefined}
            interactive={!played && !disabled}
            onMove={(from: Square, to: Square, promotion?: Promotion) =>
              setPlayed(`${from}${to}${promotion ?? ''}`)
            }
            arrows={arrows}
          />
        )}
      </View>
      {verdict ? (
        <View style={styles.result}>
          <Typography
            variant="body"
            color={passed ? 'success' : 'error'}
            accessibilityLiveRegion="polite"
          >
            {verdict}
          </Typography>
          <Button
            title="Next"
            size="lg"
            fullWidth
            disabled={disabled}
            onPress={passed ? onRemembered : onForgotten}
            testID="chess-card-next"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: 12 },
  prompt: { textAlign: 'center' },
  board: { width: '100%', alignItems: 'center' },
  result: { gap: 16, paddingTop: 4 },
});
