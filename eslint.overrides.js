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
  'node/no-missing-require',
  'no-else-return',
  'nonblock-statement-body-position',
  'no-nested-ternary',
  'no-param-reassign',
  'no-return-assign',
  'no-shadow',
  'no-undef',
  'no-underscore-dangle',
  'no-unneeded-ternary',
  'no-unreachable',
  'no-unused-vars',
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
  rules,
};
