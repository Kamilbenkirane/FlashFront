import { Typography } from '@/components/ui/Typography';
import { AppIcon } from '@/components/ui/icons';
import type { Deck, DecksMultiSelectProps } from '@/interfaces';
import { theme } from '@/tokens/theme';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const controlledSelectionKey = useMemo(
    () =>
      (controlledSelectedDeckIds ?? [])
        .map((deckId) => normalizeDeckId(deckId))
        .join(','),
    [controlledSelectedDeckIds],
  );
  const deckIdsKey = useMemo(
    () => availableDecks.map((deck) => `${deck.deck_id}`).join(','),
    [availableDecks],
  );
  const availableDeckIds = useMemo(
    () => new Set(availableDecks.map((deck) => normalizeDeckId(deck.deck_id))),
    [deckIdsKey],
  );

  useEffect(() => {
    if (controlledSelectedDeckIds === undefined) {
      return;
    }

    setSelectedDeckIds((currentSelectedDeckIds) =>
      areSameDeckSelections(currentSelectedDeckIds, controlledSelectedDeckIds)
        ? currentSelectedDeckIds
        : controlledSelectedDeckIds,
    );
  }, [controlledSelectedDeckIds, controlledSelectionKey]);

  useEffect(() => {
    setIsVisible(false);
    setSelectedSubject(null);
    const nextSelectedDeckIds = pruneDeckSelection(
      selectedDeckIds,
      availableDeckIds,
    );

    if (areSameDeckSelections(selectedDeckIds, nextSelectedDeckIds)) {
      return;
    }

    setSelectedDeckIds(nextSelectedDeckIds);
    onSelectDecks(nextSelectedDeckIds);
  }, [availableDeckIds, onSelectDecks, selectedDeckIds]);

  const isDeckSelected = useCallback(
    (deckId: string | number) =>
      selectedDeckIds.some(
        (selectedDeckId) =>
          normalizeDeckId(selectedDeckId) === normalizeDeckId(deckId),
      ),
    [selectedDeckIds],
  );

  const handleSelectDeck = useCallback(
    (deck: Deck) => {
      const nextSelectedDeckIds = toggleDeckSelection(
        selectedDeckIds,
        deck.deck_id,
      );

      if (areSameDeckSelections(selectedDeckIds, nextSelectedDeckIds)) {
        return;
      }

      setSelectedDeckIds(nextSelectedDeckIds);
      onSelectDecks(nextSelectedDeckIds);
    },
    [onSelectDecks, selectedDeckIds],
  );

  const getSelectedDecksText = () => {
    if (availableDecks.length === 0) {
      return 'No subscribed decks yet';
    }

    if (selectedDeckIds.length === 0) {
      return 'Select Decks';
    }

    const selectedNames = availableDecks
      .filter((deck) => isDeckSelected(deck.deck_id))
      .map((deck) => deck.deck_name);

    return selectedNames.join(', ');
  };

  const subjects = useMemo(
    () => [...new Set(availableDecks.map((deck) => deck.subject))],
    [availableDecks],
  );
  const filteredDecks = useMemo(
    () => availableDecks.filter((deck) => deck.subject === selectedSubject),
    [availableDecks, selectedSubject],
  );

  const styles = StyleSheet.create({
    container: {
      marginTop: theme.spacing.sm,
    },
    button: {
      backgroundColor: theme.colors.card,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.input,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...theme.shadows.sm,
    },
    list: {
      maxHeight: 220,
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.borderRadius.lg,
      marginTop: theme.spacing.xs,
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    item: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    itemSelected: {
      backgroundColor: theme.colors.primaryLight,
    },
    itemLast: {
      borderBottomWidth: 0,
    },
    backButton: {
      backgroundColor: theme.colors.secondary,
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.sm,
    },
    helperText: {
      marginTop: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          if (availableDecks.length > 0) {
            setIsVisible(!isVisible);
          }
        }}
        style={styles.button}
        disabled={availableDecks.length === 0}
      >
        <Typography
          variant="body"
          color={
            availableDecks.length === 0
              ? 'muted'
              : selectedDeckIds.length > 0
                ? 'default'
                : 'muted'
          }
          style={{ flex: 1 }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedSubject ? getSelectedDecksText() : getSelectedDecksText()}
        </Typography>
        <AppIcon
          color={theme.colors.mutedForeground}
          name={isVisible ? 'chevronUp' : 'chevronDown'}
          size={18}
        />
      </TouchableOpacity>
      {isVisible && (
        <View>
          {selectedSubject === null ? (
            <ScrollView style={styles.list}>
              {subjects.map((item, index) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => setSelectedSubject(item)}
                  style={[
                    styles.item,
                    index === subjects.length - 1 && styles.itemLast,
                  ]}
                >
                  <Typography
                    variant="body"
                    color="default"
                    style={{ textAlign: 'center' }}
                  >
                    {item}
                  </Typography>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View>
              <ScrollView style={styles.list}>
                {filteredDecks.map((item, index) => (
                  <TouchableOpacity
                    key={item.deck_id.toString()}
                    onPress={() => handleSelectDeck(item)}
                    style={[
                      styles.item,
                      isDeckSelected(item.deck_id) && styles.itemSelected,
                      index === filteredDecks.length - 1 && styles.itemLast,
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        variant="body"
                        color="default"
                        style={{
                          color: isDeckSelected(item.deck_id)
                            ? theme.colors.primary
                            : theme.colors.foreground,
                          flex: 1,
                        }}
                      >
                        {item.deck_name}
                      </Typography>
                      {isDeckSelected(item.deck_id) && (
                        <AppIcon
                          color={theme.colors.primary}
                          name="checkCircle"
                          size={18}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setSelectedSubject(null)}
                style={styles.backButton}
              >
                <Typography
                  variant="body"
                  color="default"
                  style={{ textAlign: 'center' }}
                >
                  Back to Subjects
                </Typography>
              </TouchableOpacity>
            </View>
          )}
          {selectedDeckIds.length > 0 && (
            <Typography variant="small" color="muted" style={styles.helperText}>
              {selectedDeckIds.length} deck
              {selectedDeckIds.length === 1 ? '' : 's'} selected
            </Typography>
          )}
        </View>
      )}
    </View>
  );
};

export default DecksMultiSelect;
