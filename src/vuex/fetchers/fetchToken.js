// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const axios = require('axios');

const sessionStore = require('../../browserStorage.js').session;

function orf(x) { return (x || false); }
function unixTime() { return Math.floor(Date.now() / 1e3); }
function isExpired(token) { return (unixTime() > token.exp); }


function acceptHttpErrors(err) {
  throw err;
}


async function fetchToken(vuexApi) {
  const { state, commit } = vuexApi;
  if (!state.tokenEndpoint) { return; }
  const oldToken = sessionStore.get('authToken');
  if (oldToken) {
    if (isExpired(oldToken)) {
      await commit('DELETE_TOKEN');
    } else {
      // const {sub} = jwtDecode(oldToken)
      return commit('SET_TOKEN', oldToken);
    }
  }

  let tokenReply;
  try {
    tokenReply = await axios.get(state.tokenEndpoint, {
      // maxRedirects: 0, // does not work in the browser
      withCredentials: 1, // without it, xhr won't set cookies for CORS
    });
  } catch (fetchFailed) {
    if (!fetchFailed) { throw new TypeError('Caught a false-y error'); }
    const origMsg = fetchFailed.message;
    fetchFailed.origMsg = origMsg;

    const resp = orf(fetchFailed.response);
    const { status } = resp;
    if (status === 401) { return 401; }
    console.error('fetchToken failed:', { fetchFailed, origMsg, status });
    const httpStatus = (Number.isFinite(status)
      && (status >= 100)
      && (status <= 999)
      && status);
    if (origMsg === 'Network Error') {
      fetchFailed.message += (httpStatus
        ? ': HTTP ' + httpStatus
        : ': No response or blocked by CORS');
    }
    fetchFailed.hint = state['errHintTokenFetchFailedHttp'
      + ('Status' + status || 'NoReply')];
    throw fetchFailed;
  }

  const newToken = tokenReply.data;
  if (!newToken) {
    console.error('Logged in but no token received:', tokenReply);
    throw new Error('No token received!');
  }
  await commit('SET_TOKEN', newToken);
}


module.exports = fetchToken;
