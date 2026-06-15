// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['build/**', 'public/**', 'eslint.config.js', '**/_archived/**'] },

  // Base
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // React hooks
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error',
    },
  },

  // React — plugin registered for future use; no rules enabled yet
  {
    plugins: { '@eslint-react': eslintReact },
    settings: { 'react-x': { version: 'detect' } },
  },

  // Language options
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2020 },
      parserOptions: {
        projectService: { allowDefaultProject: ['lib/*.mjs', 'lib/*.js', 'postcss.config.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Project rules
  {
    linterOptions: { reportUnusedDisableDirectives: 'off' },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      '@typescript-eslint/no-unused-vars': 'off',
      // '@typescript-eslint/no-unused-vars': [
      //   'error',
      //   {
      //     varsIgnorePattern: '^_',
      //     argsIgnorePattern: '^_',
      //     caughtErrorsIgnorePattern: '^_',
      //     destructuredArrayIgnorePattern: '^_',
      //   },
      // ],
      'no-unused-vars': 'off', // handled by @typescript-eslint
      'no-useless-assignment': 'off',
    },
  },

  // lib/ — Node.js scripts
  {
    files: ['lib/**'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // tests/setup — Node.js scripts
  {
    files: ['tests/setup/**'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // JS/JSX — relax TS-specific rules
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },

  // Test mocks — relax type precision rules
  {
    files: ['__mocks__/**'],
    rules: {
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },

  // Prettier — must be last
  prettierConfig
);
