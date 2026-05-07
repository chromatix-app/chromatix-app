module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'react-app',
    // 'plugin:jsx-a11y/recommended',
    // 'plugin:@typescript-eslint/recommended',
    // 'prettier/@typescript-eslint',
  ],
  plugins: ['react', 'prettier'],
  rules: {
    'jsx-a11y/img-redundant-alt': 0,
    'no-undef': 'error',
    'no-unused-vars': 'warn',
    // 'no-unused-vars': ['warn', { args: 'all', argsIgnorePattern: '^_' }],
    'react/display-name': 0,
    'react/jsx-filename-extension': [
      'warn',
      {
        extensions: ['.jsx', '.tsx'],
        allow: 'as-needed',
      },
    ],
    'react/no-unescaped-entities': 0,
    'react/no-unused-prop-types': 1,
    'react/prop-types': 0,
    'react/react-in-jsx-scope': 0,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
