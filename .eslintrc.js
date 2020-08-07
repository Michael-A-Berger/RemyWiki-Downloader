module.exports = {
  env: {
    es2020: true,
    node: true,
  },
  extends: [
    'airbnb/base',
  ],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    'no-underscore-dangle': 'off',
    'no-plusplus': 'off',
    'no-console': 0,
    'no-useless-escape': 'off',
    'max-len': 'off',
  },
};
