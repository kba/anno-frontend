// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const loMapValues = require('lodash.mapvalues');

const validateEditorFields = require('../anno-editor/validateEditorFields.js');


function contextAsFirstArg(func) {
  return function proxy(...args) { return func(this, ...args); };
}


module.exports = {

  template: require('./debug.html'),
  style: require('./debug.scss'),

  mixins: [
    require('../../mixin/l10n.js'),
  ],

  methods: {

    ...loMapValues({
      validateEditorFields,
    }, contextAsFirstArg),

    updateAcl(btn) {
      this.$store.commit((btn.a ? 'CHANGE_ACL' : 'EMPTY_ACL'), btn.a);
    },

  },

};
