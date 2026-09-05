import { expect, it } from 'vitest';
import { getNearestSeriesIndex, getSeriesGeometry } from './seriesGeometry';

it('plots zero truthfully, centers single points, and uses a fixed percentage scale', () => {
  expect(getSeriesGeometry([0, 5, 10], 116, 116)).toEqual({
    maximum: 10,
    baseline: 108,
    points: [
      { x: 8, y: 108 },
      { x: 58, y: 58 },
      { x: 108, y: 8 },
    ],
  });
  expect(getSeriesGeometry([0], 116, 116).points).toEqual([{ x: 58, y: 108 }]);
  expect(getSeriesGeometry([50], 116, 116, 100).points).toEqual([
    { x: 58, y: 58 },
  ]);
  expect(getNearestSeriesIndex(-20, 116, 3)).toBe(0);
  expect(getNearestSeriesIndex(58, 116, 3)).toBe(1);
  expect(getNearestSeriesIndex(180, 116, 3)).toBe(2);
  expect(getNearestSeriesIndex(58, 0, 1)).toBe(0);
});
