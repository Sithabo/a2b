/**
 * ESLint rules that keep app screens on the shared design system: buttons,
 * inputs and text come from @a2b/ui, and colours, radii and type sizes come
 * from its tokens. Used by each app's eslint.config.js:
 *
 *   const designSystem = require('@a2b/ui/eslint-design-system');
 *   module.exports = defineConfig([expoConfig, designSystem('error')]);
 *
 * @a2b/ui itself defines these primitives, so it doesn't use these rules.
 */
module.exports = function designSystem(severity = 'error') {
  return {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        severity,
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text', 'TextInput', 'TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback'],
              message:
                'Use Text, TextField, Button, IconButton or Card from @a2b/ui so every screen looks and behaves the same (Pressable is fine for custom touch targets).',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        severity,
        {
          selector: 'Property[key.name=/^(borderRadius|fontSize|fontWeight|fontFamily)$/] > Literal',
          message: 'Use the radius and typography tokens (or a Text variant) from @a2b/ui instead of a literal.',
        },
        {
          selector: 'Literal[value=/^(#[0-9a-fA-F]{3,8}|rgba?\\()/]',
          message: 'Use a colour from @a2b/ui (colors, palette, tones) instead of a literal.',
        },
      ],
    },
  };
};
