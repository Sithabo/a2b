/**
 * Raw color scales. Screens should prefer the semantic `colors` below;
 * reach for `palette` only when no semantic role fits.
 */
export const palette = {
  white: '#FFFFFF',
  black: '#000000',

  // Brand
  forest: {
    50: '#E6F4EA',
    800: '#1F4E35',
    900: '#0F3D26',
  },
  ivory: {
    50: '#FFFBF0',
    100: '#F7F6ED',
    200: '#F5F5E9',
    300: '#F4F3F0',
    400: '#F0F0E6',
  },
  gold: {
    400: '#FFD700',
    600: '#D4A017',
  },

  // Neutrals
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  stone: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    400: '#A8A29E',
    600: '#57534E',
    800: '#292524',
    900: '#1C1917',
  },
  slate: {
    200: '#E2E8F0',
  },
  zinc: {
    700: '#3F3F46',
    800: '#27272A',
  },

  // Status hues
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  orange: {
    50: '#FFF7ED',
    100: '#FDE6C8',
    200: '#FED7AA',
    700: '#C2410C',
    800: '#9A3412',
  },
  yellow: {
    300: '#FDE047',
  },
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    400: '#F87171',
    500: '#EF4444',
    700: '#B91C1C',
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    700: '#1D4ED8',
  },
  violet: {
    400: '#A78BFA',
    600: '#7C3AED',
  },
} as const;

/** Semantic roles — what every screen in every app should use. */
export const colors = {
  primary: palette.forest[900],
  primaryMuted: palette.forest[50],
  onPrimary: palette.white,

  accent: palette.amber[600],
  accentMuted: palette.amber[50],
  onAccent: palette.white,

  background: palette.ivory[200],
  surface: palette.white,
  surfaceMuted: palette.gray[50],
  surfaceSunken: palette.gray[100],

  border: palette.gray[200],
  borderStrong: palette.gray[300],

  text: palette.gray[900],
  textSecondary: palette.gray[600],
  textMuted: palette.gray[500],
  textPlaceholder: palette.gray[400],
  textInverse: palette.white,

  success: palette.emerald[600],
  successMuted: palette.emerald[50],
  warning: palette.amber[700],
  warningMuted: palette.amber[50],
  danger: palette.red[500],
  dangerMuted: palette.red[50],
  info: palette.blue[700],
  infoMuted: palette.blue[50],

  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

/** Foreground/background pairs for badges, banners and status pills. */
export const tones = {
  neutral: { fg: palette.gray[700], bg: palette.gray[100] },
  brand: { fg: palette.forest[900], bg: palette.forest[50] },
  success: { fg: palette.emerald[800], bg: palette.emerald[100] },
  warning: { fg: palette.amber[800], bg: palette.amber[100] },
  danger: { fg: palette.red[700], bg: palette.red[100] },
  info: { fg: palette.blue[700], bg: palette.blue[100] },
} as const;

export type Tone = keyof typeof tones;

/** Third-party brand colors (payment rails, card networks). Never use for UI chrome. */
export const partnerColors = {
  mtn: '#FFCC00',
  airtel: '#FF0000',
  airtelDark: '#CC0000',
  visa: '#1A1F71',
  mastercard: '#EB001B',
  amex: '#002663',
  discover: '#FF6000',
} as const;
