// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const axios = require('axios');

const browserWindow = window; // eslint-disable-line no-undef

function unixTime() { return Math.floor(Date.now() / 1e3); }
function isExpired(token) { return (unixTime() > token.exp); }


async function fetchToken(vuexApi) {
  const { state, commit } = vuexApi;
  if (!state.tokenEndpoint) { return; }
  const oldToken = browserWindow.sessionStorage.getItem('anno-token');
  if (oldToken) {
    if (isExpired(oldToken)) {
      await commit('DELETE_TOKEN');
    } else {
      // const {sub} = jwtDecode(oldToken)
      return commit('SET_TOKEN', oldToken);
    }
  }

  const newToken = (await axios.get(state.tokenEndpoint, {
    // maxRedirects: 0, // does not work in the browser
    withCredentials: 1, // without it, xhr won't set cookies for CORS
  })).data;
  if (!newToken) { throw new Error('No token received!'); }
  await commit('SET_TOKEN', newToken);
}


module.exports = fetchToken;
