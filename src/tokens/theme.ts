import { palette } from './palette';

const colors = {
  background: palette.background,
  foreground: palette.foreground,
  muted: palette.muted,
  mutedForeground: palette.mutedForeground,
  placeholder: palette.placeholder,
  surfaceRaised: palette.surfaceRaised,
  surfaceInvert: palette.surfaceInvert,
  foregroundInvert: palette.foregroundInvert,
  primary: palette.primary,
  primaryForeground: palette.primaryForeground,
  primaryLight: palette.primaryLight,
  secondary: palette.secondary,
  secondaryForeground: palette.secondaryForeground,
  accent: palette.accent,
  accentForeground: palette.accentForeground,
  success: {
    DEFAULT: palette.success,
    light: palette.successLight,
  },
  warning: {
    DEFAULT: palette.warning,
    light: palette.warningLight,
  },
  destructive: {
    DEFAULT: palette.destructive,
    foreground: palette.destructiveForeground,
    light: palette.destructiveLight,
    lightHover: palette.destructiveLightHover,
  },
  attention: {
    DEFAULT: palette.attention,
    border: palette.attentionBorder,
  },
  border: palette.border,
  input: palette.input,
  ring: palette.ring,
  hover: palette.hover,
  active: palette.active,
  hoverSubtle: palette.hoverSubtle,
  overlay: palette.overlay,
  card: palette.navy,
  gold: palette.gold,
  navy: palette.navy,
  cardForeground: palette.foreground,
  popover: palette.background,
  popoverForeground: palette.foreground,
  chart: palette.chart,
};

const fontFamily = {
  sans: 'SpaceGrotesk-Regular',
  medium: 'SpaceGrotesk-Medium',
  semibold: 'SpaceGrotesk-SemiBold',
  bold: 'SpaceGrotesk-Bold',
};

const typography = {
  display: {
    fontSize: 40,
    lineHeight: 46,
    fontFamily: fontFamily.medium,
    letterSpacing: -1.8,
  },
  heading1: {
    fontSize: 32,
    fontFamily: fontFamily.semibold,
    lineHeight: 38,
  },
  heading2: {
    fontSize: 24,
    fontFamily: fontFamily.semibold,
    lineHeight: 30,
  },
  heading3: {
    fontSize: 18,
    fontFamily: fontFamily.medium,
    lineHeight: 25,
  },
  body: {
    fontSize: 15,
    fontFamily: fontFamily.sans,
    lineHeight: 23,
  },
  caption: {
    fontSize: 13,
    fontFamily: fontFamily.sans,
    lineHeight: 18,
  },
  button: {
    fontSize: 15,
    fontFamily: fontFamily.medium,
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontFamily: fontFamily.sans,
    lineHeight: 17,
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

const shadows = {
  sm: {
    shadowColor: '#020C13',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 1,
  },
  md: {
    shadowColor: '#020C13',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 2,
  },
  lg: {
    shadowColor: '#020C13',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 4,
  },
};

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  fontFamily,
};

export type Theme = typeof theme;
