/* -*- tab-width: 2 -*- */
'use strict';

const getOwn = require('getown');

const eventBus = require('./event-bus');


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

  async doCreateAnnotationForTargetSource(vuexApi, opt) {
    console.log('createAnnotationForTargetSource:', { vuexApi, opt });
    const { state, commit } = this.vuexApi;
    if (state.editMode) {
      const err = new Error('Editor busy');
      err.name = 'ANNO_EDITOR_BUSY';
      throw err;
    }
    const { targetSource } = opt;
    if (!targetSource) { throw new Error('targetSource missing!'); }
    commit('INJECTED_MUTATION', [Object.assign, { targetSource }]);
    eventBus.$emit('create');
    console.log('createAnnotationForTargetSource:', 'Creation requested.');
  },

});


module.exports = EX;
