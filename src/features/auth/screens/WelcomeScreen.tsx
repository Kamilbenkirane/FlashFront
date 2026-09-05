import type { AuthStackScreenProps } from '@/app/navigation/types';
import { ShuffleMark } from '@/components/ui/Brand/ShuffleMark';
import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import useReducedMotion from '@/hooks/useReducedMotion';
import { useAuth } from '@/providers/AuthProvider';
import { theme } from '@/tokens/theme';
import { MotiView } from 'moti';
import type React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Ellipse, Line, Path } from 'react-native-svg';

type WelcomeScreenProps = AuthStackScreenProps<'Welcome'>;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const { authError, clearAuthError } = useAuth();
  const reducedMotion = useReducedMotion();
  const { width } = useWindowDimensions();
  const isWide = width >= 800;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.masthead}>
          <View style={styles.brand}>
            <ShuffleMark size={34} />
            <Typography style={styles.brandName}>Shuffle</Typography>
          </View>
          <Typography
            variant="caption"
            color="muted"
            style={styles.mastheadNote}
          >
            A SPACE TO GROW
          </Typography>
        </View>
        <View style={[styles.hero, isWide && styles.heroWide]}>
          <MotiView
            from={{ opacity: 0, translateY: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: reducedMotion ? 0 : 400 }}
            style={[styles.art, isWide && styles.artWide]}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <Svg width="100%" height="100%" viewBox="0 0 400 300">
              <Circle
                cx="200"
                cy="150"
                r="110"
                fill="none"
                stroke={theme.colors.border}
              />
              <Circle
                cx="200"
                cy="150"
                r="144"
                fill="none"
                stroke={theme.colors.border}
                strokeDasharray="2 9"
              />
              <Ellipse
                cx="200"
                cy="150"
                rx="182"
                ry="75"
                fill="none"
                stroke="#B8924F"
                strokeOpacity={0.5}
                transform="rotate(-24 200 150)"
              />
              <Line x1="200" y1="4" x2="200" y2="24" stroke="#B8924F" />
              <Line x1="200" y1="276" x2="200" y2="296" stroke="#B8924F" />
              <Circle cx="37" cy="188" r="5" fill={theme.colors.primary} />
              <Circle cx="338" cy="74" r="3" fill={theme.colors.primary} />
              <Path
                d="M326 218 v16 M318 226 h16 M71 62 v10 M66 67 h10"
                stroke={theme.colors.primary}
                strokeWidth={1.5}
              />
            </Svg>
            <View style={styles.cardBack} />
            <View style={styles.studyCard}>
              <View style={styles.cardTop}>
                <Typography style={styles.cardLabel} allowFontScaling={false}>
                  A MOMENT OF DISCOVERY
                </Typography>
                <AppIcon name="sparkles" size={16} color="#684B23" />
              </View>
              <Typography style={styles.cardQuestion} allowFontScaling={false}>
                Small steps.{'\n'}Lasting knowledge.
              </Typography>
              <View style={styles.cardBottom}>
                <View style={styles.cardRule} />
                <ShuffleMark size={28} color="#684B23" />
              </View>
            </View>
            <View style={styles.artCaption}>
              <View style={styles.captionDot} />
              <Typography
                variant="caption"
                color="primary"
                style={styles.artCaptionText}
                allowFontScaling={false}
              >
                ONE CARD. A NEW CONNECTION.
              </Typography>
            </View>
          </MotiView>
          <View style={[styles.copy, isWide && styles.copyWide]}>
            <Typography
              accessibilityRole="header"
              style={[styles.title, isWide && styles.titleWide]}
            >
              Make room{'\n'}for{' '}
              <Typography
                style={[styles.title, isWide && styles.titleWide]}
                color="primary"
              >
                wonder.
              </Typography>
            </Typography>
            <Typography color="muted" style={styles.subtitle}>
              A calmer way to learn. Turn a little daily curiosity into
              knowledge that stays.
            </Typography>
            {authError ? (
              <View style={styles.errorBox} accessibilityLiveRegion="polite">
                <Typography variant="body" color="error">
                  {authError}
                </Typography>
              </View>
            ) : null}
            <View style={styles.actions}>
              <Button
                title="Start your journey"
                size="lg"
                icon={
                  <AppIcon
                    name="chevronRight"
                    size={18}
                    color={theme.colors.primaryForeground}
                  />
                }
                iconPosition="right"
                accessibilityHint="Create your Shuffle account"
                onPress={() => {
                  clearAuthError();
                  navigation.navigate('Signup');
                }}
                fullWidth
              />
              <Button
                title="I already have an account"
                variant="outline"
                size="lg"
                accessibilityLabel="Sign in to your account"
                onPress={() => {
                  clearAuthError();
                  navigation.navigate('Login');
                }}
                fullWidth
              />
            </View>
            <View style={styles.footer}>
              <Typography variant="caption" color="muted">
                Your progress, wherever you go.
              </Typography>
              <Pressable
                style={styles.forgotLink}
                onPress={() => {
                  clearAuthError();
                  navigation.navigate('ForgotPassword');
                }}
                accessibilityRole="button"
              >
                <Typography variant="caption" color="primary">
                  Forgot password?
                </Typography>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xl,
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  brandName: {
    fontSize: 25,
    lineHeight: 34,
    fontFamily: theme.fontFamily.medium,
    letterSpacing: -0.8,
  },
  mastheadNote: {
    fontSize: 9,
    letterSpacing: 1.4,
    flexShrink: 1,
    textAlign: 'right',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: theme.spacing.md,
  },
  heroWide: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 56,
    paddingVertical: 64,
  },
  art: {
    height: 236,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  artWide: {
    flex: 1,
    height: 420,
    maxWidth: 520,
    marginBottom: 0,
  },
  cardBack: {
    position: 'absolute',
    width: 178,
    height: 144,
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: '#B8924F',
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    transform: [{ rotate: '10deg' }, { translateX: 12 }, { translateY: -5 }],
  },
  studyCard: {
    position: 'absolute',
    width: 196,
    minHeight: 150,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    backgroundColor: '#E6CCA0',
    transform: [{ rotate: '-8deg' }],
    gap: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cardLabel: {
    flex: 1,
    fontSize: 7,
    lineHeight: 11,
    letterSpacing: 1,
    color: '#684B23',
    fontFamily: theme.fontFamily.medium,
  },
  cardQuestion: {
    fontSize: 21,
    lineHeight: 26,
    color: '#0A2A3B',
    letterSpacing: -0.7,
    fontFamily: theme.fontFamily.medium,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.lg,
  },
  cardRule: {
    height: 1,
    backgroundColor: '#B8924F',
    flex: 1,
  },
  artCaption: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  captionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  artCaptionText: {
    fontSize: 9,
    letterSpacing: 1.2,
  },
  copy: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    gap: theme.spacing.md,
  },
  copyWide: {
    flex: 1,
  },
  title: {
    fontSize: 46,
    lineHeight: 48,
    fontFamily: theme.fontFamily.medium,
    letterSpacing: -2,
  },
  titleWide: {
    fontSize: 60,
    lineHeight: 63,
    letterSpacing: -2.8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 360,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  footer: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  forgotLink: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  errorBox: {
    backgroundColor: theme.colors.destructive.light,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
});

export default WelcomeScreen;
