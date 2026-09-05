const FIT_VALUE_PRECISION = 100;
const MIN_ALLOWED_FONT_SCALE = 0.1;
const MAX_ALLOWED_FONT_SCALE = 1;

export const DEFAULT_MATH_TEXT_MIN_FONT_SCALE = 0.65;
export const DEFAULT_MATH_TEXT_FIT_STEP_PX = 2;
const DEFAULT_MATH_TEXT_FIT_TOLERANCE_PX = 2;

const roundFitValue = (value: number) =>
  Math.round(value * FIT_VALUE_PRECISION) / FIT_VALUE_PRECISION;

const sanitizeMinFontScale = (minFontScale: number) => {
  if (!Number.isFinite(minFontScale)) {
    return DEFAULT_MATH_TEXT_MIN_FONT_SCALE;
  }

  return Math.min(
    MAX_ALLOWED_FONT_SCALE,
    Math.max(MIN_ALLOWED_FONT_SCALE, minFontScale),
  );
};

const sanitizeFitStepPx = (fitStepPx: number) => {
  if (!Number.isFinite(fitStepPx) || fitStepPx <= 0) {
    return DEFAULT_MATH_TEXT_FIT_STEP_PX;
  }

  return fitStepPx;
};

const normalizeDimension = (value?: number | null) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

export const buildFitFontSizes = ({
  fontSize,
  minFontScale = DEFAULT_MATH_TEXT_MIN_FONT_SCALE,
  fitStepPx = DEFAULT_MATH_TEXT_FIT_STEP_PX,
}: {
  fontSize: number;
  minFontScale?: number;
  fitStepPx?: number;
}) => {
  if (!Number.isFinite(fontSize) || fontSize <= 0) {
    return [fontSize];
  }

  const sanitizedMinFontScale = sanitizeMinFontScale(minFontScale);
  const sanitizedFitStepPx = sanitizeFitStepPx(fitStepPx);
  const minimumFontSize = roundFitValue(fontSize * sanitizedMinFontScale);
  const fitFontSizes = [roundFitValue(fontSize)];

  let nextFontSize = fontSize;
  while (nextFontSize - sanitizedFitStepPx > minimumFontSize) {
    nextFontSize -= sanitizedFitStepPx;
    fitFontSizes.push(roundFitValue(nextFontSize));
  }

  const lastFitFontSize = fitFontSizes[fitFontSizes.length - 1];
  if (lastFitFontSize !== minimumFontSize) {
    fitFontSizes.push(minimumFontSize);
  }

  return fitFontSizes;
};

export const scaleLineHeight = ({
  fontSize,
  lineHeight,
  nextFontSize,
}: {
  fontSize: number;
  lineHeight: number;
  nextFontSize: number;
}) => {
  if (!Number.isFinite(fontSize) || fontSize <= 0) {
    return lineHeight;
  }

  return roundFitValue((lineHeight / fontSize) * nextFontSize);
};

export const shouldShrinkToFit = ({
  availableHeight,
  availableWidth,
  measuredHeight,
  measuredWidth,
  tolerancePx = DEFAULT_MATH_TEXT_FIT_TOLERANCE_PX,
}: {
  availableHeight?: number | null;
  availableWidth?: number | null;
  measuredHeight?: number | null;
  measuredWidth?: number | null;
  tolerancePx?: number;
}) => {
  const nextTolerancePx = Number.isFinite(tolerancePx) ? tolerancePx : 0;
  const normalizedAvailableHeight = normalizeDimension(availableHeight);
  const normalizedMeasuredHeight = normalizeDimension(measuredHeight);
  const normalizedAvailableWidth = normalizeDimension(availableWidth);
  const normalizedMeasuredWidth = normalizeDimension(measuredWidth);
  const heightOverflow =
    normalizedAvailableHeight !== null &&
    normalizedMeasuredHeight !== null &&
    normalizedMeasuredHeight > normalizedAvailableHeight + nextTolerancePx;
  const widthOverflow =
    normalizedAvailableWidth !== null &&
    normalizedMeasuredWidth !== null &&
    normalizedMeasuredWidth > normalizedAvailableWidth + nextTolerancePx;

  return Boolean(heightOverflow || widthOverflow);
};

export const getNextFitIndex = ({
  currentIndex,
  fitFontSizes,
  availableHeight,
  availableWidth,
  measuredHeight,
  measuredWidth,
}: {
  currentIndex: number;
  fitFontSizes: number[];
  availableHeight?: number | null;
  availableWidth?: number | null;
  measuredHeight?: number | null;
  measuredWidth?: number | null;
}) => {
  if (
    !shouldShrinkToFit({
      availableHeight,
      availableWidth,
      measuredHeight,
      measuredWidth,
    })
  ) {
    return currentIndex;
  }

  return Math.min(currentIndex + 1, fitFontSizes.length - 1);
};
