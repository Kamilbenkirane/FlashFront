import { describe, expect, it } from 'vitest';

import {
  areSameDeckSelections,
  normalizeDeckId,
  pruneDeckSelection,
  toggleDeckSelection,
} from '@/features/library/components/deckSelection';

describe('deckSelection helpers', () => {
  it('normalizes deck ids consistently', () => {
    expect(normalizeDeckId(42)).toBe('42');
    expect(normalizeDeckId('42')).toBe('42');
  });

  it('compares selections by normalized deck id and order', () => {
    expect(areSameDeckSelections([1, '2'], ['1', 2])).toBe(true);
    expect(areSameDeckSelections([1, '2'], [2, '1'])).toBe(false);
  });

  it('prunes deck ids that are no longer available', () => {
    expect(
      pruneDeckSelection(['3', 5, '8'], new Set(['5', '8', '13'])),
    ).toEqual([5, '8']);
  });

  it('adds a deck to the current selection when toggled on', () => {
    expect(toggleDeckSelection(['3', 5], '8')).toEqual(['3', 5, '8']);
  });

  it('removes a deck from the current selection when toggled off', () => {
    expect(toggleDeckSelection(['3', 5, '8'], 5)).toEqual(['3', '8']);
  });
});
