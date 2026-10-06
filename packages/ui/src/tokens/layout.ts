import type { TextStyle } from 'react-native';

/** 4pt scale. */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const;

export const layout = {
  /** Horizontal screen padding. */
  gutter: 20,
  /** Minimum height of anything tappable. */
  touchMin: 48,
  /** Height of primary flow buttons and inputs. */
  touchLg: 56,
} as const;

export const radius = {
  xs: 4,
  sm: 8,
  /** Cards, buttons, inputs. */
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
} as const;

export const borderWidth = {
  hairline: 1,
  focus: 2,
} as const;

/** Low-blur "hard" shadows; borders do most of the depth work. */
export const elevation = {
  none: {},
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700', letterSpacing: -0.5 },
  h1: { fontSize: 24, lineHeight: 32, fontWeight: '700', letterSpacing: -0.25 },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: '700' },
  h3: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  button: { fontSize: 16, lineHeight: 20, fontWeight: '600' },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
