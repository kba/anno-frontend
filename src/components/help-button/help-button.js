/* -*- tab-width: 2 -*- */
'use strict';

const helpUrl = require('./help-url.js');

module.exports = {

  mixins: [
    /* eslint-disable global-require */
    require('../../mixin/l10n'),
  ],

  template: require('./help-button.html'),
  style: require('./help-button.scss'),

  props: {
    topic:        { type: String, required: true },
    title:        { type: String, default: '' },
    buttonLabel:  { type: String, default: '' },
    bootstrapBtnCls:  { type: [String, null], default: 'outline-secondary' },
  },

  computed: {
    helpUrl,
  },

};
