const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'google',
  ],
  settings: {
    'import/resolver': {
      'node': {
        'extensions': ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
      },
    },
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 8,
  },
  plugins: [
    'import',
  ],
  rules: {
    'curly': [ERROR, 'multi-line'],
    'quotes': [ERROR, 'single'],
    'no-eval': [ERROR],
    'linebreak-style': [OFF],
    'no-new-wrappers': [ERROR],
    'no-var': [ERROR],
    'max-len': [OFF],
    'no-redeclare': [OFF],
    'prefer-const': [WARN],
    'eqeqeq': [ERROR, 'smart'],
    'object-curly-spacing': [ERROR, 'always'],
    'space-infix-ops': [ERROR],
    'comma-dangle': [ERROR, 'always-multiline'],
    'semi': [ERROR, 'always'],
    'no-multi-spaces': [ERROR],
    'indent': [ERROR, 2, { 'SwitchCase': 1 }],
    'space-before-blocks': [ERROR, 'always'],
    // see: https://github.com/import-js/eslint-plugin-import/issues/1810
  },
};
