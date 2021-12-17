/* -*- tab-width: 2 -*- */
'use strict';

const clipboardHelper = require('../../clipboard-helper.js');

/* eslint-disable global-require */
module.exports = {
  mixins: [
    require('../../mixin/l10n'),
  ],

  props: {
    cliptext:     { type: String, required: true },
    defaultCls:   { type: Boolean, default: true },
  },

  template: require('./ccb.html'),

  mounted() {
    const clipBtn = this;
    clipboardHelper.setupOneTrigger(clipBtn.$el, {
      successLabelElem: clipBtn.$refs.successLabel,
    });
  },

};
