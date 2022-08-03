'use strict';

const rules = {
};

const offs = [
  'arrow-parens',
  'block-spacing',
  'brace-style',
  'comma-dangle',
  'dot-notation',
  'eqeqeq',
  'func-names',
  'import/extensions',
  'import/newline-after-import',
  'import/no-unresolved',
  'import/no-webpack-loader-syntax',
  'indent',
  'max-len',
  'no-alert',
  'n/no-missing-require',
  'no-else-return',
  'nonblock-statement-body-position',
  'no-nested-ternary',
  'no-param-reassign',
  'no-return-assign',
  'no-underscore-dangle',
  'no-unneeded-ternary',
  'object-curly-spacing',
  'object-property-newline',
  'prefer-destructuring',
  'prefer-object-spread',
  'quotes',
  'semi',
  'space-before-function-paren',
  'space-infix-ops',
  'space-in-parens',
  'space-unary-ops',
  'strict',
];
offs.forEach((r) => { rules[r] = 'off'; });

module.exports = {
  env: {
    es6: true,
    browser: true,
  },
  rules,
};
