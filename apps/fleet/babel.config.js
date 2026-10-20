module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          // zustand's ESM build reads import.meta.env, which the web bundle
          // can't parse untransformed ("Cannot use 'import.meta' outside a module").
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
