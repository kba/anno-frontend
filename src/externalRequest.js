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


module.exports = EX;
