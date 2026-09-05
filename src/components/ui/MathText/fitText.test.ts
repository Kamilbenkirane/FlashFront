import {
  buildFitFontSizes,
  getNextFitIndex,
  scaleLineHeight,
  shouldShrinkToFit,
} from '@/components/ui/MathText/fitText';
import { describe, expect, it } from 'vitest';

describe('fitText', () => {
  it('builds a bounded descending font-size ladder', () => {
    expect(
      buildFitFontSizes({
        fontSize: 32,
        minFontScale: 0.65,
        fitStepPx: 2,
      }),
    ).toEqual([32, 30, 28, 26, 24, 22, 20.8]);
  });

  it('keeps line height proportional to the chosen font size', () => {
    expect(
      scaleLineHeight({
        fontSize: 32,
        lineHeight: 40,
        nextFontSize: 24,
      }),
    ).toBe(30);
  });

  it('detects overflow on either axis before shrinking', () => {
    expect(
      shouldShrinkToFit({
        availableHeight: 180,
        availableWidth: 240,
        measuredHeight: 183,
        measuredWidth: 220,
      }),
    ).toBe(true);
    expect(
      shouldShrinkToFit({
        availableHeight: 180,
        availableWidth: 240,
        measuredHeight: 170,
        measuredWidth: 245,
      }),
    ).toBe(true);
    expect(
      shouldShrinkToFit({
        availableHeight: 180,
        availableWidth: 240,
        measuredHeight: 180,
        measuredWidth: 240,
      }),
    ).toBe(false);
  });

  it('advances to the next fit step only when overflow is detected', () => {
    const fitFontSizes = [32, 30, 28];

    expect(
      getNextFitIndex({
        currentIndex: 0,
        fitFontSizes,
        availableHeight: 180,
        availableWidth: 240,
        measuredHeight: 220,
        measuredWidth: 240,
      }),
    ).toBe(1);
    expect(
      getNextFitIndex({
        currentIndex: 1,
        fitFontSizes,
        availableHeight: 180,
        availableWidth: 240,
        measuredHeight: 170,
        measuredWidth: 220,
      }),
    ).toBe(1);
    expect(
      getNextFitIndex({
        currentIndex: 2,
        fitFontSizes,
        availableHeight: 180,
        availableWidth: 240,
        measuredHeight: 260,
        measuredWidth: 260,
      }),
    ).toBe(2);
  });
});
