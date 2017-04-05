const Vue = require('vue')
const Vuex = require('vuex')

const annotation = require('./module/annotation')
const annotationList = require('./module/annotationList')

module.exports = new Vuex.Store({
    state: {
        current: -1,
        language: 'de',
    },
    modules: {
        annotation,
        annotationList,
    },
    // strict: true
})
