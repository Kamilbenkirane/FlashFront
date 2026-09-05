import type { AuthStackScreenProps } from '@/app/navigation/types';
import { ShuffleMark } from '@/components/ui/Brand/ShuffleMark';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { useAuth } from '@/providers/AuthProvider';
import { theme } from '@/tokens/theme';
import type React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WelcomeScreenProps = AuthStackScreenProps<'Welcome'>;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { authError, clearAuthError } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 800;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brand}>
          <ShuffleMark size={32} />
          <Typography style={styles.name}>Shuffle</Typography>
        </View>
        <View style={[styles.hero, isWide && styles.heroWide]}>
          <View
            style={[styles.art, isWide && styles.artWide]}
            accessible
            accessibilityLabel="Example flashcard: bonjour means hello"
          >
            <View
              style={[
                styles.exampleCard,
                styles.questionCard,
                isWide && styles.exampleCardWide,
              ]}
            >
              <Typography style={styles.exampleWord} allowFontScaling={false}>
                bonjour
              </Typography>
            </View>
            <View
              style={[
                styles.exampleCard,
                styles.answerCard,
                isWide && styles.exampleCardWide,
              ]}
            >
              <Typography
                style={[styles.exampleWord, styles.answerWord]}
                allowFontScaling={false}
              >
                hello
              </Typography>
            </View>
          </View>
          <View style={[styles.copy, isWide && styles.copyWide]}>
            <View style={styles.intro}>
              <Typography
                accessibilityRole="header"
                style={[styles.title, isWide && styles.titleWide]}
              >
                Remember more.
              </Typography>
              <Typography color="muted" style={styles.description}>
                Learn with flashcards and spaced repetition.
              </Typography>
            </View>
            {authError ? (
              <Typography color="error" accessibilityLiveRegion="polite">
                {authError}
              </Typography>
            ) : null}
            <View style={styles.actions}>
              <Button
                title="Create account"
                size="lg"
                onPress={() => {
                  clearAuthError();
                  navigation.navigate('Signup');
                }}
                fullWidth
              />
              <Button
                title="Sign in"
                variant="outline"
                size="lg"
                onPress={() => {
                  clearAuthError();
                  navigation.navigate('Login');
                }}
                fullWidth
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
    padding: theme.spacing.xxl,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
  name: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: theme.fontFamily.medium,
    letterSpacing: -0.8,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing.xxxl,
    paddingVertical: theme.spacing.xxl,
  },
  heroWide: { flexDirection: 'row-reverse', alignItems: 'center', gap: 64 },
  art: { width: '100%', maxWidth: 320, height: 216, alignSelf: 'center' },
  artWide: { flex: 1, maxWidth: 400, height: 300 },
  exampleCard: {
    position: 'absolute',
    width: '64%',
    height: 116,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleCardWide: { height: 148 },
  questionCard: {
    top: 4,
    left: 0,
    backgroundColor: theme.colors.surfaceRaised,
    borderWidth: 1,
    borderColor: theme.colors.input,
    transform: [{ rotate: '-6deg' }],
  },
  answerCard: {
    bottom: 4,
    right: 0,
    backgroundColor: '#E6CCA0',
    transform: [{ rotate: '6deg' }],
    ...theme.shadows.md,
  },
  exampleWord: {
    fontSize: 30,
    lineHeight: 38,
    fontFamily: theme.fontFamily.medium,
    letterSpacing: -0.8,
  },
  answerWord: { color: theme.colors.primaryForeground },
  copy: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: theme.spacing.xxl,
  },
  copyWide: { flex: 1 },
  intro: { gap: theme.spacing.md },
  title: {
    fontSize: 36,
    lineHeight: 42,
    fontFamily: theme.fontFamily.medium,
    letterSpacing: -1.2,
  },
  titleWide: { fontSize: 48, lineHeight: 54, letterSpacing: -1.8 },
  description: { fontSize: 16, lineHeight: 24 },
  actions: { gap: theme.spacing.md },
});

export default WelcomeScreen;
