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
  subtitle: string;
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

            <View style={styles.header}>
              <Typography
                variant="caption"
                color="primary"
                style={styles.eyebrow}
              >
                A LITTLE CURIOSITY. EVERY DAY.
              </Typography>
              <Typography accessibilityRole="header" style={styles.title}>
                {title}
              </Typography>
              <Typography variant="body" color="muted" style={styles.subtitle}>
                {subtitle}
              </Typography>
            </View>

            <View style={styles.card}>
              {error ? (
                <View
                  style={[styles.messageBox, styles.errorBox]}
                  accessibilityLiveRegion="polite"
                >
                  <Typography variant="body" color="error">
                    {error}
                  </Typography>
                </View>
              ) : null}

              {notice ? (
                <View
                  style={[styles.messageBox, styles.noticeBox]}
                  accessibilityLiveRegion="polite"
                >
                  <Typography variant="body">{notice}</Typography>
                </View>
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
    maxWidth: 480,
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
    fontSize: 24,
    lineHeight: 32,
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
  card: {
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xxl,
    backgroundColor: theme.colors.card,
    gap: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.md,
  },
  eyebrow: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: theme.fontFamily.medium,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 36,
    lineHeight: 41,
    letterSpacing: -1.5,
    fontFamily: theme.fontFamily.medium,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
  },
  body: {
    gap: theme.spacing.xl,
  },
  footer: {
    gap: theme.spacing.sm,
  },
  messageBox: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: theme.colors.destructive.light,
    borderColor: theme.colors.destructive.light,
  },
  noticeBox: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.border,
  },
});
