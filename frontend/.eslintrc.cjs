const path = require('path');

module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  extends: ['airbnb', 'airbnb-typescript', 'airbnb/hooks', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: path.join(__dirname, 'tsconfig.json'),
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/function-component-definition': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['config'] }],
  },
};
