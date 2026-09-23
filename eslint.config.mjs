import js from '@eslint/js';
import globals from 'globals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  {
    ignores: ['dist/'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
  // Must follow the rule sets above: this disables the core rules that would
  // fight prettier, so anything re-enabled below has to come after it.
  prettierRecommended,
  {
    rules: {
      quotes: [
        'error',
        'single',
        {
          avoidEscape: true,
        },
      ],
    },
  },
];
