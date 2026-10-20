// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const designSystem = require('@a2b/ui/eslint-design-system');

module.exports = defineConfig([
  expoConfig,
  designSystem('error'),
  {
    ignores: ['dist/*'],
  },
]);
