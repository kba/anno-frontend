// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

const loMapValues = require('lodash.mapvalues');
const jwtDecode = require('jwt-decode');

const validateEditorFields = require('../anno-editor/validateEditorFields.js');


function contextAsFirstArg(func) {
  return function proxy(...args) { return func(this, ...args); };
}

function err2str(f, x) { try { return f(x); } catch (e) { return String(e); } }


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

    dumpAppConfig() {
      const u = undefined;
      const cfg = {
        ...this.$store.state,
        acl: u,
        annotationList: u,
        editing: u,
        localizations: u,
      };
      Object.keys(cfg).forEach(function optimize(key) {
        const val = cfg[key];
        if (val === undefined) {
          delete cfg[key];
          return;
        }
        if (val && /token$/ig.test(key)) {
          cfg[key + ' » jwtDecode'] = err2str(() => jwtDecode(val));
        }
      });
      return cfg;
    },

  },

};
