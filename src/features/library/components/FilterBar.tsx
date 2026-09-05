import { Typography } from '@/components/ui/Typography';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import type React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

export interface FilterBarProps {
  subjects: string[];
  selectedSubject: string | null;
  onSubjectSelect: (subject: string | null) => void;
  showSubscribedOnly: boolean;
  onToggleSubscribed: () => void;
  subscribedCount: number;
  className?: string;
  testID?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  subjects,
  selectedSubject,
  onSubjectSelect,
  showSubscribedOnly,
  onToggleSubscribed,
  subscribedCount,
  className = '',
  testID,
}) => (
  <View className={className} style={styles.container} testID={testID}>
    <View style={styles.tabs} accessibilityRole="tablist">
      {[false, true].map((subscribed) => {
        const selected = showSubscribedOnly === subscribed;
        const label = subscribed ? `Added (${subscribedCount})` : 'All decks';
        return (
          <Pressable
            key={String(subscribed)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            aria-selected={selected}
            accessibilityLabel={label}
            onPress={() => {
              if (!selected) {
                triggerHaptic('selection');
                onToggleSubscribed();
              }
            }}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <Typography variant="button" color={selected ? 'primary' : 'muted'}>
              {label}
            </Typography>
          </Pressable>
        );
      })}
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.subjects}
    >
      {[null, ...subjects].map((subject) => {
        const selected = selectedSubject === subject;
        return (
          <Pressable
            key={subject ?? 'all-subjects'}
            accessibilityRole="button"
            accessibilityLabel={subject ?? 'All subjects'}
            accessibilityState={{ selected }}
            aria-pressed={selected}
            onPress={() => {
              triggerHaptic('selection');
              onSubjectSelect(subject);
            }}
            style={[styles.subject, selected && styles.subjectSelected]}
          >
            <Typography
              variant="caption"
              color={selected ? 'primary' : 'muted'}
            >
              {subject ?? 'All subjects'}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  tabSelected: { backgroundColor: theme.colors.card },
  subjects: { gap: theme.spacing.sm },
  subject: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  subjectSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
});
