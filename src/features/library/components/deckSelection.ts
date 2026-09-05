export const normalizeDeckId = (deckId: string | number) => `${deckId}`;

export const areSameDeckSelections = (
  left: readonly (string | number)[],
  right: readonly (string | number)[],
) =>
  left.length === right.length &&
  left.every(
    (deckId, index) =>
      normalizeDeckId(deckId) === normalizeDeckId(right[index]),
  );

export const pruneDeckSelection = (
  selectedDeckIds: readonly (string | number)[],
  availableDeckIds: ReadonlySet<string>,
) =>
  selectedDeckIds.filter((deckId) =>
    availableDeckIds.has(normalizeDeckId(deckId)),
  );

export const toggleDeckSelection = (
  selectedDeckIds: readonly (string | number)[],
  deckId: string | number,
) => {
  const deckKey = normalizeDeckId(deckId);

  return selectedDeckIds.some(
    (selectedDeckId) => normalizeDeckId(selectedDeckId) === deckKey,
  )
    ? selectedDeckIds.filter(
        (selectedDeckId) => normalizeDeckId(selectedDeckId) !== deckKey,
      )
    : [...selectedDeckIds, deckId];
};
