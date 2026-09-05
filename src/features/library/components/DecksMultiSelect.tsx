import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import type { Deck, DecksMultiSelectProps } from '@/interfaces';
import { theme } from '@/tokens/theme';
import { triggerHaptic } from '@/utils/haptics';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  areSameDeckSelections,
  normalizeDeckId,
  pruneDeckSelection,
  toggleDeckSelection,
} from './deckSelection';

const DecksMultiSelect: React.FC<DecksMultiSelectProps> = ({
  decks,
  onSelectDecks,
  selectedDeckIds: controlledSelectedDeckIds,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDeckIds, setSelectedDeckIds] = useState<(string | number)[]>(
    controlledSelectedDeckIds ?? [],
  );
  const availableDecks = Array.isArray(decks) ? decks : [];
  const deckIdsKey = availableDecks
    .map((deck) => normalizeDeckId(deck.deck_id))
    .join(',');
  const availableDeckIds = useMemo(
    () => new Set(availableDecks.map((deck) => normalizeDeckId(deck.deck_id))),
    [deckIdsKey],
  );

  useEffect(() => {
    if (controlledSelectedDeckIds !== undefined) {
      setSelectedDeckIds((current) =>
        areSameDeckSelections(current, controlledSelectedDeckIds)
          ? current
          : controlledSelectedDeckIds,
      );
    }
  }, [controlledSelectedDeckIds]);

  useEffect(() => {
    setIsVisible(false);
    setSelectedSubject(null);
  }, [availableDeckIds]);

  useEffect(() => {
    const next = pruneDeckSelection(selectedDeckIds, availableDeckIds);
    if (!areSameDeckSelections(selectedDeckIds, next)) {
      setSelectedDeckIds(next);
      onSelectDecks(next);
    }
  }, [availableDeckIds, onSelectDecks, selectedDeckIds]);

  const isDeckSelected = useCallback(
    (deckId: string | number) =>
      selectedDeckIds.some(
        (selected) => normalizeDeckId(selected) === normalizeDeckId(deckId),
      ),
    [selectedDeckIds],
  );
  const handleSelectDeck = (deck: Deck) => {
    triggerHaptic('selection');
    const next = toggleDeckSelection(selectedDeckIds, deck.deck_id);
    setSelectedDeckIds(next);
    onSelectDecks(next);
  };
  const selectedNames = availableDecks
    .filter((deck) => isDeckSelected(deck.deck_id))
    .map((deck) => deck.deck_name);
  const subjects = [...new Set(availableDecks.map((deck) => deck.subject))];
  const filteredDecks = availableDecks.filter(
    (deck) => selectedSubject === null || deck.subject === selectedSubject,
  );

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          triggerHaptic('selection');
          setIsVisible(!isVisible);
        }}
        style={[styles.button, isVisible && styles.buttonOpen]}
        disabled={availableDecks.length === 0}
        accessibilityRole="button"
        accessibilityLabel={
          selectedNames.length
            ? `Selected decks: ${selectedNames.join(', ')}`
            : 'Choose decks'
        }
        accessibilityHint="Open the list to choose one or more decks"
        accessibilityState={{
          expanded: isVisible,
          disabled: availableDecks.length === 0,
        }}
        aria-expanded={isVisible}
      >
        <AppIcon name="layers" size={21} color={theme.colors.primary} />
        <View style={styles.buttonCopy}>
          <Typography variant="body" numberOfLines={1}>
            {availableDecks.length === 0
              ? 'No decks available'
              : selectedNames.length > 0
                ? selectedNames.join(', ')
                : 'Choose decks'}
          </Typography>
          {selectedDeckIds.length > 0 ? (
            <Typography variant="small" color="muted">
              {selectedDeckIds.length} selected
            </Typography>
          ) : null}
        </View>
        <AppIcon
          name={isVisible ? 'chevronUp' : 'chevronDown'}
          size={18}
          color={theme.colors.mutedForeground}
        />
      </Pressable>

      {isVisible ? (
        <View style={styles.picker}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjects}
          >
            {[null, ...subjects].map((subject) => (
              <Pressable
                key={subject ?? 'all'}
                onPress={() => setSelectedSubject(subject)}
                accessibilityRole="button"
                accessibilityLabel={subject ?? 'All subjects'}
                accessibilityState={{ selected: selectedSubject === subject }}
                aria-pressed={selectedSubject === subject}
                style={[
                  styles.subject,
                  selectedSubject === subject && styles.subjectSelected,
                ]}
              >
                <Typography
                  variant="caption"
                  color={selectedSubject === subject ? 'primary' : 'muted'}
                >
                  {subject ?? 'All subjects'}
                </Typography>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView
            style={styles.list}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {filteredDecks.map((deck) => {
              const selected = isDeckSelected(deck.deck_id);
              return (
                <Pressable
                  key={deck.deck_id}
                  onPress={() => handleSelectDeck(deck)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`${deck.deck_name}, ${deck.subject}`}
                  accessibilityState={{ checked: selected }}
                  aria-checked={selected}
                  style={[styles.item, selected && styles.itemSelected]}
                >
                  <View style={styles.buttonCopy}>
                    <Typography variant="body" numberOfLines={2}>
                      {deck.deck_name}
                    </Typography>
                    <Typography variant="small" color="muted">
                      {deck.subject}
                      {deck.card_count === undefined
                        ? ''
                        : ` · ${deck.card_count} cards`}
                    </Typography>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      selected && styles.checkboxSelected,
                    ]}
                  >
                    {selected ? (
                      <AppIcon
                        name="check"
                        size={15}
                        color={theme.colors.primaryForeground}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
          <Pressable
            onPress={() => setIsVisible(false)}
            accessibilityRole="button"
            style={styles.done}
          >
            <Typography variant="button" color="primary">
              Done
            </Typography>
            <Typography variant="caption" color="muted">
              {selectedDeckIds.length} selected
            </Typography>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: theme.spacing.sm },
  button: {
    minHeight: 56,
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.input,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  buttonOpen: { borderColor: theme.colors.primary },
  buttonCopy: { flex: 1, minWidth: 0, gap: 3 },
  picker: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.card,
    overflow: 'hidden',
  },
  subjects: { padding: theme.spacing.sm, gap: theme.spacing.xs },
  subject: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
  },
  subjectSelected: { backgroundColor: theme.colors.primaryLight },
  list: { maxHeight: 280 },
  item: {
    minHeight: 68,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  itemSelected: { backgroundColor: theme.colors.primaryLight },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: theme.colors.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  done: {
    minHeight: 48,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

export default DecksMultiSelect;
