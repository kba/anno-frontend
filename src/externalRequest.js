/* -*- tab-width: 2 -*- */
'use strict';

const getOwn = require('getown');

const eventBus = require('./event-bus');

const hasOwn = Function.call.bind(Object.prototype.hasOwnProperty);


const EX = async function externalRequest(annoApp, action, ...args) {
  const impl = getOwn(EX, 'do' + action);
  if (!impl) { throw new Error('Unsupported action: ' + action); }
  async function proxy(vuexApi) {
    const ctx = { annoApp, vuexApi, action, args };
    return impl.call(ctx, vuexApi, ...args);
  }
  return annoApp.$store.dispatch('runInjectedFunc', proxy);
};


Object.assign(EX, {

  async doConfigureTargetAndCreateAnnotation(vuexApi, param) {
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
  },

});


module.exports = EX;
