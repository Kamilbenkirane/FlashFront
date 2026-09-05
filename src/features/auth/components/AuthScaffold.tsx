import { ShuffleMark } from '@/components/ui/Brand/ShuffleMark';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { theme } from '@/tokens/theme';
import type React from 'react';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthScaffoldProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  error?: string | null;
  notice?: string | null;
  onBack?: () => void;
}

export const AuthScaffold: React.FC<AuthScaffoldProps> = ({
  title,
  subtitle,
  children,
  footer,
  error,
  notice,
  onBack,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.shell}>
            <View style={styles.masthead}>
              {onBack ? (
                <Pressable
                  onPress={onBack}
                  style={({ pressed }) => [
                    styles.backButton,
                    pressed && styles.backButtonPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                >
                  <View style={styles.backIcon}>
                    <AppIcon
                      name="chevronRight"
                      size={20}
                      color={theme.colors.foreground}
                    />
                  </View>
                </Pressable>
              ) : null}
              <View style={styles.brand}>
                <ShuffleMark size={32} />
                <Typography style={styles.brandName}>Shuffle</Typography>
              </View>
            </View>

            <View style={styles.panel}>
              <View style={styles.header}>
                <Typography accessibilityRole="header" style={styles.title}>
                  {title}
                </Typography>
                {subtitle ? (
                  <Typography variant="body" color="muted">
                    {subtitle}
                  </Typography>
                ) : null}
              </View>

              {error ? (
                <Typography color="error" accessibilityLiveRegion="polite">
                  {error}
                </Typography>
              ) : null}

              {notice ? (
                <Typography accessibilityLiveRegion="polite">
                  {notice}
                </Typography>
              ) : null}

              <View style={styles.body}>{children}</View>
            </View>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxxl,
  },
  shell: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    gap: theme.spacing.xxl,
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  brandName: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.8,
    fontFamily: theme.fontFamily.medium,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {
    backgroundColor: theme.colors.secondary,
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  header: {
    gap: theme.spacing.md,
  },
  panel: {
    gap: theme.spacing.xxl,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.9,
    fontFamily: theme.fontFamily.medium,
  },
  body: {
    gap: theme.spacing.xl,
  },
  footer: {
    gap: theme.spacing.sm,
  },
});
