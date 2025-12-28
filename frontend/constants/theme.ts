/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const forest = '#0F3D26';
const ivory = '#F5F5E9';
const amber = '#D97706';
const white = '#FFFFFF';
const black = '#000000';

export const Colors = {
  light: {
    text: forest,
    background: ivory,
    tint: forest,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: forest,
    border: '#E5E7EB', // Gray-200
    card: white,
    error: '#EF4444',
  },
  dark: {
    text: ivory,
    background: forest,
    tint: amber,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: amber,
    border: '#1F4E35', // Slightly lighter forest
    card: '#1A4D33', // Slightly lighter forest for cards
    error: '#EF4444',
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
