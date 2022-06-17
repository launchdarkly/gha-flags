// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: false,
    node: true,
    es2021: true,
    es6: true,
    jest: true,
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': ['error'],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
  },
};
