import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import { theme } from '@/tokens/theme';
import type React from 'react';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
}

export const AuthScaffold: React.FC<AuthScaffoldProps> = ({
  title,
  subtitle,
  children,
  footer,
  error,
  notice,
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
          <View style={styles.hero}>
            <View style={styles.heroBadge}>
              <AppIcon color={theme.colors.primary} name="flash" size={24} />
            </View>
            <Typography variant="heading1" style={styles.heroTitle}>
              FlashFront
            </Typography>
            <Typography
              variant="body"
              color="muted"
              style={styles.heroSubtitle}
            >
              Study with synced progress, starter decks, and a real account.
            </Typography>
          </View>

          <Card variant="raised" padding="lg" style={styles.card}>
            <View style={styles.header}>
              <Typography variant="heading2">{title}</Typography>
              <Typography variant="body" color="muted">
                {subtitle}
              </Typography>
            </View>

            {error ? (
              <View
                style={[styles.messageBox, styles.errorBox]}
                accessibilityLiveRegion="polite"
              >
                <Typography variant="small" color="error">
                  {error}
                </Typography>
              </View>
            ) : null}

            {notice ? (
              <View
                style={[styles.messageBox, styles.noticeBox]}
                accessibilityLiveRegion="polite"
              >
                <Typography variant="small" color="muted">
                  {notice}
                </Typography>
              </View>
            ) : null}

            <View style={styles.body}>{children}</View>
          </Card>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
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
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  heroTitle: {
    textAlign: 'center',
  },
  heroSubtitle: {
    textAlign: 'center',
  },
  card: {
    gap: theme.spacing.md,
  },
  header: {
    gap: theme.spacing.xs,
  },
  body: {
    gap: theme.spacing.md,
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
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.border,
  },
});
