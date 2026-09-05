import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
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
      {[
        { title: 'Explore', subscribed: false, icon: 'library' as const },
        { title: 'My decks', subscribed: true, icon: 'layers' as const },
      ].map(({ title, subscribed, icon }) => {
        const selected = showSubscribedOnly === subscribed;
        return (
          <Pressable
            key={title}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            aria-selected={selected}
            accessibilityLabel={
              subscribed ? `My decks, ${subscribedCount} decks` : title
            }
            onPress={() => {
              if (!selected) {
                triggerHaptic('selection');
                onToggleSubscribed();
              }
            }}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <AppIcon
              name={icon}
              size={17}
              color={
                selected ? theme.colors.primary : theme.colors.mutedForeground
              }
            />
            <Typography variant="button" color={selected ? 'primary' : 'muted'}>
              {title}
            </Typography>
            {subscribed ? (
              <View style={styles.count}>
                <Typography
                  variant="small"
                  color={selected ? 'primary' : 'muted'}
                >
                  {subscribedCount}
                </Typography>
              </View>
            ) : null}
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
  container: { gap: theme.spacing.lg },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabSelected: {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
  },
  count: {
    minWidth: 22,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
  },
  subjects: { gap: theme.spacing.sm },
  subject: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  subjectSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
});
