import { theme } from '@/tokens/theme';
import { StyleSheet } from 'react-native';

export const flashcardStyles = StyleSheet.create({
  container: { width: '100%', minHeight: 300 },
  activeCardShell: { flex: 1 },
  cardEdge: {
    ...StyleSheet.absoluteFillObject,
    top: 8,
    bottom: -5,
    left: 6,
    right: 6,
    borderRadius: 20,
    backgroundColor: '#B8924F',
    opacity: 0.65,
  },
  card: {
    flex: 1,
    width: '100%',
    borderRadius: 20,
    padding: 24,
    backgroundColor: '#F5F1E8',
  },
  backCard: { backgroundColor: '#F5F1E8' },
  faceLabel: {
    ...theme.typography.caption,
    color: '#586970',
  },
  textContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 28,
    minHeight: 150,
  },
});
