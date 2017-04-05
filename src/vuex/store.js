const Vue = require('vue')
const Vuex = require('vuex')

const annotation = require('./module/annotation')

// Vue.use(Vuex)

module.exports = new Vuex.Store({
    modules: {
        annotation,
    },
    strict: true
})
