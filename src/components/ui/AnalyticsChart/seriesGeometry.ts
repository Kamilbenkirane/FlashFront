const PADDING = 8;

export const getSeriesGeometry = (
  values: number[],
  width: number,
  height: number,
  fixedMaximum?: number,
) => {
  const maximum = fixedMaximum ?? Math.max(1, ...values);
  const baseline = height - PADDING;
  return {
    maximum,
    baseline,
    points: values.map((value, index) => ({
      x:
        values.length <= 1
          ? width / 2
          : PADDING +
            (index / (values.length - 1)) * Math.max(0, width - PADDING * 2),
      y:
        baseline -
        (Math.max(0, Math.min(value, maximum)) / maximum) *
          (height - PADDING * 2),
    })),
  };
};

export const getNearestSeriesIndex = (
  x: number,
  width: number,
  count: number,
) =>
  count <= 1
    ? 0
    : Math.max(
        0,
        Math.min(
          count - 1,
          Math.round(
            ((x - PADDING) / Math.max(1, width - PADDING * 2)) * (count - 1),
          ),
        ),
      );
