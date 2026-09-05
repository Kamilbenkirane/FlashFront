import { Button } from '@/components/ui/Button';
import { Typography } from '@/components/ui/Typography';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import type React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export interface FilterBarProps {
  subjects: string[];
  selectedSubject: string | null;
  onSubjectSelect: (subject: string | null) => void;
  showSubscribedOnly: boolean;
  onToggleSubscribed: () => void;
  className?: string;
  testID?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  subjects,
  selectedSubject,
  onSubjectSelect,
  showSubscribedOnly,
  onToggleSubscribed,
  className = '',
  testID,
}) => {
  const handleSubjectSelect = (subject: string | null) => {
    triggerHaptic('selection');
    onSubjectSelect(subject);
  };

  const handleToggleSubscribed = () => {
    triggerHaptic('impact');
    onToggleSubscribed();
  };

  return (
    <View className={className} style={styles.container} testID={testID}>
      <View style={styles.section}>
        <Typography variant="caption" color="muted" style={styles.sectionLabel}>
          Subjects
        </Typography>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          <Button
            title="All"
            variant={selectedSubject === null ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => handleSubjectSelect(null)}
            className="mr-2"
            accessibilityState={{ selected: selectedSubject === null }}
          />

          {subjects.map((subject) => (
            <Button
              key={subject}
              title={subject}
              variant={selectedSubject === subject ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => handleSubjectSelect(subject)}
              className="mr-2"
              accessibilityState={{ selected: selectedSubject === subject }}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.toggleRow}>
        <Button
          title={showSubscribedOnly ? 'Show All' : 'Subscribed Only'}
          variant={showSubscribedOnly ? 'primary' : 'secondary'}
          size="sm"
          onPress={handleToggleSubscribed}
          className="flex-1"
          accessibilityState={{ selected: showSubscribedOnly }}
          accessibilityLabel={
            showSubscribedOnly ? 'Show all decks' : 'Show subscribed decks only'
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.sm,
  },
  sectionLabel: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  filtersRow: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  toggleRow: {
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'flex-start',
  },
});
