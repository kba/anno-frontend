const config = require('../config')
const Vue = require('vue')
const Vuex = require('vuex')

const annotation = require('./module/annotation')
const annotationList = require('./module/annotationList')

module.exports = new Vuex.Store({
    state: {
        current: -1,
        language: config.defaultLang,
        writetoken: "YES",
        acl: {
            'https://anno.ub.uni-heidelberg.de/456': {
                edit: true,
                comment: false,
            },
        },
    },
    modules: {
        annotation,
        annotationList,
    },
    mutations: {

        CHANGE_ACL(state, rules) {
            state.acl = state.acl || {}
            Object.assign(state.acl, rules)
        }

    }
    // strict: true
})
