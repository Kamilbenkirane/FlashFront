import { theme } from '@/tokens/theme';
import { StyleSheet } from 'react-native';

export const flashcardStyles = StyleSheet.create({
  container: { position: 'relative', width: '100%', minHeight: 300 },
  activeCardShell: { flex: 1 },
  stackLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#658594',
  },
  stackLayerBack: {
    backgroundColor: '#193E4C',
    transform: [{ scale: 0.94 }, { translateY: 17 }],
  },
  stackLayerMiddle: {
    backgroundColor: '#B8924F',
    transform: [{ scale: 0.97 }, { translateY: 9 }],
  },
  card: {
    flex: 1,
    width: '100%',
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#F5F1E8',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    ...theme.shadows.lg,
  },
  backCard: { backgroundColor: '#F0E6D1', borderColor: '#D8B878' },
  faceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  faceDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8A6A2E' },
  eyebrowText: {
    ...theme.typography.small,
    fontFamily: theme.fontFamily.semibold,
    color: '#586970',
    letterSpacing: 2,
  },
  textContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 28,
    minHeight: 150,
  },
  faceFooter: { alignItems: 'center', gap: 5 },
  faceHint: {
    ...theme.typography.caption,
    color: '#586970',
    textAlign: 'center',
  },
  flipHint: {
    ...theme.typography.small,
    fontFamily: theme.fontFamily.medium,
    color: '#0A2A3B',
    textAlign: 'center',
  },
});
