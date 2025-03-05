import antfu from '@antfu/eslint-config';

export default antfu({
  svelte: true,
  stylistic: {
    semi: true,
  },
  rules: {
    'node/prefer-global/process': 'off',
    'no-new': 'off',
  },
  ignores: [
    'packages/web/build/**/*',
    'packages/functions/src/database/migrations/**/*',
  ],
});
