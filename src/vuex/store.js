/* -*- tab-width: 2 -*- */
'use strict';

const {collectIds} = require('@kba/anno-util');
const jwtDecode = require('jwt-decode');
const promisify = require('pify');

const apiFactory = require('../api');
const eventBus = require('../event-bus');
const editing = require('./module/editing');
const annotationList = require('./module/annotationList');
const sessionStore = require('../browserStorage.js').session;

const fetchToken = require('./fetchers/fetchToken.js');
const fetchList = require('./fetchers/fetchList.js');

// function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }

module.exports = {
    strict: process.env.NODE_ENV != 'production',
    state: {
      // No settings here! Default config belongs in `../default-config.js`.
      acl: null,
      cacheBusterEnabled: false,
      editMode: null,
      token: null,
    },
    modules: {
        editing,
        annotationList,
    },
    getters: {

        isLoggedIn(state) {
            const fake = (state.acl || false)['debug:override:isLoggedIn'];
            if (fake || (fake === false)) { return fake; }
            const { token } = state;
            if (!token) { return false; }
            return Boolean((jwtDecode(state.token) || false).sub);
        },

        tokenDecoded(state) {
            // console.log('tokenDecoded', state.token, state.isLoggedIn)
            return state.isLoggedIn ? jwtDecode(state.token) : {}
        },

        allIds(state) {
            const ret = collectIds(state.annotationList.list).filter(u => u.startsWith('http'))
            ret.push(state.targetSource)
            return ret
        },

    },
    mutations: {

        CHANGE_ACL(state, rules) {
            state.acl = Object.assign({}, state.acl, rules);
            eventBus.$emit('updatedPermissions');
        },

        EMPTY_ACL(state) {
            state.acl = {};
            eventBus.$emit('updatedPermissions');
        },

        SET_TOKEN(state, token) {
          state.token = token;
          sessionStore.put('authToken', token);
        },

        DELETE_TOKEN(state/* , token */) {
          state.token = null;
          sessionStore.del('authToken');
        },

        SET_EDIT_MODE(state, editMode) {
            state.editMode = editMode
        },

        INJECTED_MUTATION(state, mutationSpec) {
          const [mutaFunc, ...mutaArgs] = mutationSpec;
          // console.debug('INJECTED_MUTATION go!',
          //   { state: jsonDeepCopy(state), mutaFunc, mutaArgs });
          mutaFunc(state, ...mutaArgs);
          // console.debug('INJECTED_MUTATION done',
          //   { state: jsonDeepCopy(state), mutaFunc, mutaArgs });
        },

    },

    actions: {

      fetchToken,
      fetchList,

      async fetchAcl({state, commit, getters}) {
        if ((state.acl || false)['debug:skipFetchAcl']) { return; }
        const api = apiFactory(state);
        const chk = promisify(api.aclCheck.bind(api));
        try {
          const perms = await chk(getters.allIds);
          commit('CHANGE_ACL', perms);
        } catch (aclFetchFailed) {
          window.aclFetchFailed = aclFetchFailed;
          console.error({ aclFetchFailed });
          throw aclFetchFailed;
        }
      },

        async runInjectedFunc(vuexApi, func) {
          // console.debug('runInjectedFunc', { vuexApi, func });
          return func(vuexApi);
        },

        assumeLoggedOut({commit}) {
            commit('DELETE_TOKEN')
            commit('EMPTY_ACL')
        },

    },
}
