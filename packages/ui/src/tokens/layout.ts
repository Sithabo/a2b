import { fontFamily } from './fonts.ts';
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
  display: { fontSize: 32, lineHeight: 40, fontFamily: fontFamily.bold, letterSpacing: -0.5 },
  h1: { fontSize: 24, lineHeight: 32, fontFamily: fontFamily.bold, letterSpacing: -0.25 },
  h2: { fontSize: 20, lineHeight: 28, fontFamily: fontFamily.bold },
  h3: { fontSize: 17, lineHeight: 24, fontFamily: fontFamily.semibold },
  /** Larger body for screens read outdoors or at arm's length (driver app). */
  bodyLg: { fontSize: 18, lineHeight: 26, fontFamily: fontFamily.regular },
  body: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.regular },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontFamily: fontFamily.semibold },
  bodySm: { fontSize: 14, lineHeight: 20, fontFamily: fontFamily.regular },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.regular },
  label: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.bold, letterSpacing: 0.6, textTransform: 'uppercase' },
  button: { fontSize: 16, lineHeight: 20, fontFamily: fontFamily.semibold },
  /** Bottom tab labels (pass as tabBarLabelStyle). */
  tab: { fontSize: 12, lineHeight: 16, fontFamily: fontFamily.semibold },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
