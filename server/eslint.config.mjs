import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
