import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

/**
 * Inter, one family name per weight. Android can't pick a weight from a single
 * custom family (it fakes bold on top), so styles name the family for the
 * weight they want instead of setting fontWeight.
 */
export const fontFamily = {
  regular: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

/**
 * Loads Inter. Returns true once the fonts are ready (or failed to load, in
 * which case text falls back to the system font). Call it in each app's root
 * layout and keep the splash screen up until it's true.
 */
export function useA2BFonts(): boolean {
  const [loaded, error] = useFonts({
    [fontFamily.regular]: Inter_400Regular,
    [fontFamily.semibold]: Inter_600SemiBold,
    [fontFamily.bold]: Inter_700Bold,
  });
  return loaded || !!error;
}
