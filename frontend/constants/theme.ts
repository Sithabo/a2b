/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const forest = '#0F3D26';
const ivory = '#F5F5E9';
const amber = '#D97706';
const lime = '#C4E84A'; // New Lime Green
const white = '#FFFFFF';
const black = '#000000';
const gray = {
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  900: '#111827',
};

export const Colors = {
  light: {
    text: forest,
    background: ivory,
    tint: forest,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: forest,
    border: gray[200],
    card: white,
    error: '#EF4444',
    // Custom
    primary: forest,
    secondary: lime,
    lime: lime,
    ivory: ivory,
    amber: amber,
    gray: gray,
  },
  dark: {
    text: ivory,
    background: forest,
    tint: amber,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: amber,
    border: '#1F4E35', 
    card: '#1A4D33',
    error: '#EF4444',
     // Custom
     primary: forest,
     secondary: lime,
     lime: lime,
     ivory: ivory,
     amber: amber,
     gray: gray, // In dark mode, we might want to invert these, but for now keeping consistent mapping
  },
};

export const Fonts = Platform.select({
  ios: {
    padding: 'system-ui',
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
