/* -*- tab-width: 2 -*- */
'use strict';
/* eslint-disable global-require */


const loGet = require('lodash.get');
const loSet = require('lodash.set');


function normWsp(tx) {
  return String(tx).replace(/((?:^|\n +)[\{\[])\n +/g, '$1 ') + '\n';
}


module.exports = {

  template: require('./exim.html'),
  style: require('./exim.scss'),

  props: {
    extraButtons:   { type: [Array, undefined] },
    path:           { type: String, required: true },
  },

  data() {
    return {
      baseCls: 'json-export-import-field',
      redumpedAt: 0,
    };
  },

  methods: {

    extraButtonClicked(btn) {
      console.log('extraButtonClicked', btn);
      return btn.f.call(this, btn);
    },

    redumpJson() {
      this.redumpedAt = Date.now();
    },

    dumpJson() {
      const exim = this;
      const { path } = exim;
      const { state } = exim.$store;
      const data = loGet(state, path);
      return normWsp(JSON.stringify(data, null, 2));
    },

    importJson() {
      const exim = this;
      const { path } = exim;
      const { state } = exim.$store;
      const inputJson = exim.$refs.txa.value;
      function upd(state) {
        try {
          const data = JSON.parse(inputJson);
          loSet(state, path, data);
          window.alert('Imported into: ' + path);
        } catch (err) {
          err.inputJson = inputJson;
          console.error('Error while trying to import JSON:', err);
          window.alert('Error while trying to import JSON:\n' + err);
        }
      }
      this.$store.commit('INJECTED_MUTATION', [upd]);
    },

  },

};
