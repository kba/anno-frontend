const config = require('../config')
const axios = require('axios')
const Vue = require('vue')
const Vuex = require('vuex')
const {collectIds} = require('@kba/anno-util')
const apiFactory = require('../api')
const jwtDecode = require('jwt-decode')

const annotation = require('./module/annotation')
const annotationList = require('./module/annotationList')

module.exports = new Vuex.Store({
    strict: true,
    state: {
        language: config.defaultLang,
        tokenEndpoint: 'http://localhost:3000/auth/token',
        loginEndpoint: 'http://localhost:3000/auth/login?from=',
        logoutEndpoint: 'http://localhost:3000/auth/logout',
        token: null,
        acl: {},
    },
    modules: {
        annotation,
        annotationList,
    },
    getters: {

        allIds(state) {
            const ret = collectIds(state.annotationList.list || [])
            ret.push(state.targetSource)
            return ret
        },

    },
    mutations: {

        CHANGE_ACL(state, rules) {
            state.acl = state.acl || {}
            Object.assign(state.acl, rules)
        },

        SET_TOKEN(state, token) {
            state.token = token
        },

        DELETE_TOKEN(state, token) {
            state.token = null
        },

        EMPTY_ACL(state) {
            state.acl = null
        }

    },

    actions: {

        fetchToken({state, commit, dispatch}) {
            return new Promise((resolve, reject) => {
                axios.get(state.tokenEndpoint, {
                    // maxRedirects: 0, // does not work in the browser
                    withCredentials: 1, // without it, xhr won't set cookies for CORS
                }).then(resp => {
                    const token = resp.data
                    try {
                        jwtDecode(token)
                        commit('SET_TOKEN', token)
                        dispatch('fetchList')
                        resolve()
                    } catch (err) {
                        reject("NO_TOKEN")
                    }
                }).catch(reject)
            })
        },

        fetchAcl({state, commit, getters}) {
            return new Promise((resolve, reject) => {
                console.log("ACL check")
                apiFactory(state).aclCheck(getters.allIds, (err, perms) => {
                    if (err) reject(err)
                    commit('CHANGE_ACL', perms)
                    resolve()
                })
            })
        },

        fetchList({state, commit, dispatch}) {
            return new Promise((resolve, reject) => {
                console.log("Search")
                apiFactory(state).search({'$target': state.targetSource}, (err, list) => {
                    if (err) reject(err)
                    commit('REPLACE_LIST', list)
                    dispatch('fetchAcl')
                })
            })
        }
    },
})
