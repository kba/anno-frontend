const config = require('../config')
const axios = require('axios')
const Vue = require('vue')
const Vuex = require('vuex')
const {collectIds} = require('@kba/anno-util')
const apiFactory = require('../api')

const annotation = require('./module/annotation')
const annotationList = require('./module/annotationList')

module.exports = new Vuex.Store({
    strict: true,
    state: {
        language: config.defaultLang,
        tokenEndpoint: 'http://localhost:3000/auth/token',
        loginEndpoint: 'http://localhost:3000/auth/login?from=',
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

    },

    actions: {

        fetchToken({state, commit}) {
            return new Promise((resolve, reject) => {
            axios.get(state.tokenEndpoint, {maxRedirects: 0})
                .then(resp => {
                    console.log(resp)
                    const token = resp.headers['X-Token']
                    if (token) {
                        commit('SET_TOKEN', token)
                        resolve(token)
                    } else {
                        reject("No token")
                    }
                })
                .catch(reject)
            })
        },

        fetchList({state, commit, getters}) {
            const api = apiFactory(state)

            return new Promise((resolve, reject) => {
                console.log("Search")
                api.search({'$target': state.targetSource}, (err, list) => {
                    if (err) reject(err)
                    commit('REPLACE_LIST', list)
                    console.log("ACL check")
                    api.aclCheck(getters.allIds, (err, perms) => {
                        if (err) reject(err)
                        commit('CHANGE_ACL', perms)
                        resolve()
                    })
                })
            })
        }
    },
})
