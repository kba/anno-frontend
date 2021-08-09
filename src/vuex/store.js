const {collectIds} = require('@kba/anno-util');
const jwtDecode = require('jwt-decode');

const apiFactory = require('../api');
const eventBus = require('../event-bus');
const editing = require('./module/editing');
const annotationList = require('./module/annotationList');
const state = require('./state');

const fetchToken = require('./fetchers/fetchToken.js');
const fetchList = require('./fetchers/fetchList.js');

// function jsonDeepCopy(x) { return JSON.parse(JSON.stringify(x)); }

module.exports = {
    strict: process.env.NODE_ENV != 'production',
    state,
    modules: {
        editing,
        annotationList,
    },
    getters: {

        isLoggedIn(state) {
            return state.token && jwtDecode(state.token).sub
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
            state.acl = state.acl || {}
            Object.assign(state.acl, rules)
            eventBus.$emit('updatedPermissions')
        },

        EMPTY_ACL(state) {
            state.acl = {}
            eventBus.$emit('updatedPermissions')
        },

        SET_TOKEN(state, token) {
            state.token = token
            window.sessionStorage.setItem('anno-token', token)
        },

        DELETE_TOKEN(state, token) {
            state.token = null
            window.sessionStorage.removeItem('anno-token')
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

        fetchAcl({state, commit, getters}) {
            return new Promise((resolve, reject) => {
                // console.log("ACL check")
                apiFactory(state).aclCheck(getters.allIds, (err, perms) => {
                    if (err) {
                        commit('EMPTY_ACL')
                        reject(err)
                    } else {
                        commit('CHANGE_ACL', perms)
                        resolve()
                    }
                })
            })
        },

        async runInjectedFunc(vuexApi, func) {
          // console.debug('runInjectedFunc', { vuexApi, func });
          return func(vuexApi);
        },

        logout({state, commit}) {
            commit('DELETE_TOKEN')
            commit('EMPTY_ACL')
            // if (state.logoutEndpoint) {
            //     window.location.replace(state.logoutEndpoint)
            // }
        },

    },
}
