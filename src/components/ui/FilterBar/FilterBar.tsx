import type React from 'react';
import { ScrollView, View } from 'react-native';
import { triggerHaptic } from '../../../utils/haptics';
import { Button } from '../Button';
import { Typography } from '../Typography';
import type { FilterBarProps } from './FilterBar.types';

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
    <View
      className={`bg-neutral-50 dark:bg-neutral-800 py-3 ${className}`}
      testID={testID}
    >
      {/* Subject Filters */}
      <View className="mb-2">
        <Typography
          variant="caption"
          className="text-neutral-500 dark:text-neutral-400 px-4 mb-2"
        >
          Subjects
        </Typography>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-2"
        >
          {/* All Subjects Button */}
          <Button
            title="All"
            variant={selectedSubject === null ? 'primary' : 'secondary'}
            size="sm"
            onPress={() => handleSubjectSelect(null)}
            className="mr-2"
          />

          {/* Individual Subject Buttons */}
          {subjects.map((subject) => (
            <Button
              key={subject}
              title={subject}
              variant={selectedSubject === subject ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => handleSubjectSelect(subject)}
              className="mr-2"
            />
          ))}
        </ScrollView>
      </View>

      {/* Additional Filters */}
      <View className="flex-row items-center justify-end px-4">
        <Button
          title={`${showSubscribedOnly ? 'Show All' : 'Subscribed Only'}`}
          variant={showSubscribedOnly ? 'primary' : 'secondary'}
          size="sm"
          onPress={handleToggleSubscribed}
          className="flex-1 max-w-[200px]"
        />
      </View>
    </View>
  );
};
