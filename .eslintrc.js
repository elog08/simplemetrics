module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    mocha: true,
  },
  plugins: [
    'mocha'
  ],
  extends: [
    'plugin:mocha/recommended',
    'airbnb-base'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
  },
};
