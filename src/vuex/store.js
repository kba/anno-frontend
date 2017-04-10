const config = require('../config')
const Vue = require('vue')
const Vuex = require('vuex')
const {collectIds} = require('@kba/anno-util')
const annoApiFactory = require('../api/annoApi')

const annotation = require('./module/annotation')
const annotationList = require('./module/annotationList')

module.exports = new Vuex.Store({
    strict: true,
    state: {
        current: -1,
        language: config.defaultLang,
        writetoken: "YES",
        acl: {},
    },
    modules: {
        annotation,
        annotationList,
    },
    getters: {

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
        },

    },

    actions: {

        fetchList({state, commit, getters}) {
            const api = annoApiFactory(state)

            return new Promise((resolve, reject) => {
                console.log("Search")
                api.search({'$target': state.targetSource}, (err, list) => {
                    if (err)  reject(err)
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
