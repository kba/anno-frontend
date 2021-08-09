/* -*- tab-width: 2 -*- */
'use strict';

const eventBus = require('../event-bus.js');


const hasOwn = Function.call.bind(Object.prototype.hasOwnProperty);


async function composeAnno(vuexApi, param) {
  const { state, commit } = this.vuexApi;
  if (state.editMode) {
    const err = new Error('Editor busy');
    err.name = 'ANNO_EDITOR_BUSY';
    throw err;
  }
  const updCfg = {
    targetFragment: null,
    targetImage: null,
  };
  Object.keys(param).forEach(function copy(key) {
    if (hasOwn(updCfg, key)) {
      updCfg[key] = param[key];
    } else {
      throw new Error('Unsupported target option: ' + key);
    }
  });
  commit('INJECTED_MUTATION', [Object.assign, updCfg]);
  eventBus.$emit('create');
}


module.exports = {
  doConfigureTargetAndComposeAnnotation: composeAnno,
};
