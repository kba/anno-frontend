/* -*- tab-width: 2 -*- */
'use strict';
/* eslint-disable global-require */


const loGet = require('lodash.get');
const loSet = require('lodash.set');
const sortedJson = require('safe-sortedjson');

// eslint-disable-next-line no-alert,no-undef
function panic(msg) { window.alert(msg); }

module.exports = {

  template: require('./exim.html'),
  style: require('./exim.scss'),

  props: {
    extraButtons:   { type: Array },
    path:           { type: String },
    dumpFunc:       { type: Function },
    importFunc:     { type: Function },
  },

  data() {
    return {
      baseCls: 'json-export-import-field',
      redumpedAt: 0,
    };
  },

  methods: {

    decideButtons() {
      const exim = this;
      const buttons = [].concat(exim.extraButtons, [
        ((exim.path || exim.dumpFunc)
          && { c: '✍', n: 'dump', h: 'export', f: exim.redumpJson }),
        ((exim.path || exim.importFunc)
          && { c: '⏎', n: 'load', h: 'import', f: exim.importJson }),
      ]).filter(Boolean);
      return buttons;
    },

    extraButtonClicked(btn) {
      console.log('extraButtonClicked', btn);
      return btn.f.call(this, btn);
    },

    redumpJson() {
      this.redumpedAt = Date.now();
    },

    dumpJson() {
      const exim = this;
      const { path, dumpFunc } = exim;
      const { state } = exim.$store;
      const data = (dumpFunc || loGet)(state, path);
      return sortedJson(data);
    },

    importJson() {
      const exim = this;
      const { path, importFunc } = exim;
      const inputJson = exim.$refs.txa.value;
      function upd(state) {
        try {
          const data = JSON.parse(inputJson);
          (importFunc || loSet)(state, path, data);
          panic('Imported into: ' + path);
        } catch (err) {
          err.inputJson = inputJson;
          console.error('Error while trying to import JSON:', err);
          panic('Error while trying to import JSON:\n' + err);
        }
      }
      this.$store.commit('INJECTED_MUTATION', [upd]);
    },

  },

};
