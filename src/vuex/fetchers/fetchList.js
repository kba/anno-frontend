// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const pify = require('pify');

const apiFactory = require('../../api.js');
const eventBus = require('../../event-bus.js');


const apiSearch = pify((st, q, cb) => apiFactory(st).search(q, cb));


async function fetchList(vuexApi) {
  const { state, commit } = vuexApi;
  await commit('ANNOLIST_UPDATE_STATE', {
    list: [],
    fetching: true,
    fetchFailed: false,
  });
  eventBus.$emit('fetching');
  try {
    const query = {
      '$target': state.targetSource,
    };
    const list = await apiSearch(state, query);
    await commit('REPLACE_LIST', list);
    eventBus.$emit('fetched', list);
  } catch (cannotList) {
    await commit('ANNOLIST_UPDATE_STATE', {
      fetching: false,
      fetchFailed: cannotList,
    });
    eventBus.$emit('fetchListFailed', cannotList);
  }
}


module.exports = fetchList;
