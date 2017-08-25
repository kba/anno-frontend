const {defaultLang} = require('../../l10n-config.json')
const axios = require('axios')
const Vue = require('vue')
const Vuex = require('vuex')
const {collectIds} = require('@kba/anno-util')
const apiFactory = require('../api')
const jwtDecode = require('jwt-decode')
const eventBus = require('../event-bus')

const editing = require('./module/editing')
const annotationList = require('./module/annotationList')

function isExpired(token) { return (token.exp < Date.now() / 1000) }

module.exports = {
    strict: process.env.NODE_ENV != 'production',
    state: {
        language: defaultLang,
        annoEndpoint: null,
        tokenEndpoint: null,
        loginEndpoint: null,
        logoutEndpoint: null,
        purlTemplate: null,
        purlId: null,
        purlAnnoInitiallyOpen: true,
        targetSource: window.location.href,
        targetImage: null,
        targetImageWidth: -1,
        targetImageHeight: -1,
        iiifUrlTemplate: null,
        targetThumbnail: null,
        collection: null,
        token: null,
        loginId: null,
        acl: null,

        editMode: null,

        enableLogoutButton: true,
        enableIIIF: true,

        cacheBusterEnabled: false,
    },
    modules: {
        editing,
        annotationList,
    },
    getters: {

        isLoggedIn(state) {
            return state.loginId && state.token && jwtDecode(state.token).sub === state.loginId
        },

        tokenDecoded(state) {
            // console.log('tokenDecoded', state.token, state.isLoggedIn)
            return state.isLoggedIn ? jwtDecode(state.token) : {}
        },

        allIds(state) {
            const ret = collectIds(state.annotationList.list)
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
            window.sessionStorage.setItem('anno-token', token);
        },

        DELETE_TOKEN(state, token) {
            state.token = null
            window.sessionStorage.removeItem('anno-token');
        },

        SET_EDIT_MODE(state, editMode) {
            state.editMode = editMode
        },

        ENABLE_CACHE_BUSTER(state) { state.cacheBusterEnabled = true },

        DISABLE_CACHE_BUSTER(state) { state.cacheBusterEnabled = false }

    },

    actions: {

        fetchToken({state, commit, dispatch}) {
            return new Promise((resolve, reject) => {
                var token = window.sessionStorage.getItem('anno-token');
                if (token) {
                    if (isExpired(token)) {
                        commit('DELETE_TOKEN')
                    } else {
                        const {sub} = jwtDecode(token)
                        commit('SET_TOKEN', token)
                        return resolve()
                    }
                }
                axios.get(state.tokenEndpoint, {
                    // maxRedirects: 0, // does not work in the browser
                    withCredentials: 1, // without it, xhr won't set cookies for CORS
                }).then(resp => {
                    const token = resp.data
                    try {
                        const {sub} = jwtDecode(token)
                        commit('SET_TOKEN', token)
                        dispatch('fetchList')
                        resolve()
                    } catch (err) {
                        commit('DELETE_TOKEN')
                        reject("NO_TOKEN")
                    }
                }).catch(reject)
            })
        },

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

        /*
         * Cache-busting to get around 304 with changed schemes
         * https://gitlab.ub.uni-heidelberg.de/DWork/Presentation/issues/75
         */

        fetchList({state, commit, dispatch}) {
            return new Promise((resolve, reject) => {
                const query = {'$target': state.targetSource}
                if (state.cacheBusterEnabled) {
                    query._cacheBuster = Date.now()
                }
                // console.log("Search", query)
                apiFactory(state).search(query, (err, list) => {
                    // if (err && !state.cacheBusterEnabled) {
                    //     // console.log("Initial fail, try busting cache")
                    //     commit('ENABLE_CACHE_BUSTER')
                    //     dispatch('fetchList')
                    // } else if (err) {
                    //     console.log("Failed even with cache busting. much sadness :(")
                    //     reject(err)
                    // } else {
                        commit('DISABLE_CACHE_BUSTER')
                        commit('REPLACE_LIST', list)
                        eventBus.$emit('fetched', list)
                        resolve(dispatch('fetchAcl'))
                    // }
                })
            })
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
