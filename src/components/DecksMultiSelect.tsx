import type React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { Deck, DecksMultiSelectProps } from '../interfaces';
import { Typography } from './ui/Typography';

const DecksMultiSelect: React.FC<DecksMultiSelectProps> = ({
  decks,
  onSelectDecks,
}) => {
  const { theme } = useTheme();

  if (!Array.isArray(decks)) {
    decks = [];
  }
  const [isVisible, setIsVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedDeckIds, setSelectedDeckIds] = useState<(string | number)[]>(
    [],
  );

  const handleSelectDeck = (deck: Deck) => {
    const isAlreadySelected = selectedDeckIds.includes(deck.deck_id);
    const newSelectedDeckIds = isAlreadySelected
      ? selectedDeckIds.filter((id) => id !== deck.deck_id)
      : [...selectedDeckIds, deck.deck_id];

    setSelectedDeckIds(newSelectedDeckIds);
    onSelectDecks(newSelectedDeckIds);
  };

  const getSelectedDecksText = () => {
    if (selectedDeckIds.length === 0) return 'Select Decks';
    const selectedNames = decks
      .filter((deck) => selectedDeckIds.includes(deck.deck_id))
      .map((deck) => deck.deck_name);
    return selectedNames.join(', ');
  };

  const subjects = [...new Set(decks.map((deck) => deck.subject))];
  const filteredDecks = decks.filter(
    (deck) => deck.subject === selectedSubject,
  );

  const styles = StyleSheet.create({
    container: {
      marginTop: theme.spacing.sm,
    },
    button: {
      backgroundColor: theme.colors.primary[500],
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.sm,
    },
    list: {
      maxHeight: 200,
      backgroundColor: theme.colors.neutral[50],
      borderColor: theme.colors.neutral[200],
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      marginTop: theme.spacing.xs,
      ...theme.shadows.md,
    },
    item: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.neutral[200],
      backgroundColor: theme.colors.neutral[50],
    },
    itemSelected: {
      backgroundColor: theme.colors.primary[100],
    },
    itemLast: {
      borderBottomWidth: 0,
    },
    backButton: {
      backgroundColor: theme.colors.neutral[100],
      padding: theme.spacing.md,
      margin: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.sm,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setIsVisible(!isVisible)}
        style={styles.button}
      >
        <Typography
          variant="body"
          color="neutral"
          style={{ color: '#ffffff', textAlign: 'center' }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedSubject ? getSelectedDecksText() : 'Select Subject/Decks'}
        </Typography>
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
                    color="neutral"
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
                      selectedDeckIds.includes(item.deck_id) &&
                        styles.itemSelected,
                      index === filteredDecks.length - 1 && styles.itemLast,
                    ]}
                  >
                    <Typography
                      variant="body"
                      color="neutral"
                      style={{ textAlign: 'center' }}
                    >
                      {item.deck_name}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => setSelectedSubject(null)}
                style={styles.backButton}
              >
                <Typography
                  variant="body"
                  color="neutral"
                  style={{ textAlign: 'center' }}
                >
                  Back to Subjects
                </Typography>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default DecksMultiSelect;
