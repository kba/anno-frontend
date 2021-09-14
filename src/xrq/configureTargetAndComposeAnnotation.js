/* -*- tab-width: 2 -*- */
'use strict';

const eventBus = require('../event-bus.js');
const checkAuth = require('../mixin/auth.js').methods.$auth;


const hasOwn = Function.call.bind(Object.prototype.hasOwnProperty);


async function composeAnno(vuexApi, param) {
  const { state, commit } = this.vuexApi;

  const authMode = param.authorized;
  /* ^-- How to deal with potentially lacking authorization.
      `expect` (default): Throw an error if the user doesn't have permission.
      `silent`: Open the compose dialog only if we have permission.
      `check`: Return whether (boolean) the user currently has permission.
      `ignore`: Open the compose dialog anyway.
  */
  delete param.authorized;

  const { targetSource } = state;

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

  const stubApp = { $store: { state } };
  const authAccept = await checkAuth.call(stubApp, 'create', targetSource);
  if (authMode === 'check') { return Boolean(authAccept); }
  if (!authAccept) {
    if (authMode === 'silent') { return false; }
    if (authMode !== 'ignore') {
      throw new Error('AnnoApp lacks permission to compose this annotation.');
    }
  }

  if (state.editMode) {
    const err = new Error('Editor busy');
    err.name = 'ANNO_EDITOR_BUSY';
    throw err;
  }

  commit('INJECTED_MUTATION', [Object.assign, updCfg]);
  eventBus.$emit('create');
}


module.exports = {
  doConfigureTargetAndComposeAnnotation: composeAnno,
};
