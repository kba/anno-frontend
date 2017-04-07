const Vue = require('vue')

module.exports = function displayAnnotations(options={}) {

    options.targetSource = options.targetSource || window.location.href

    ;[
        'el',
    ].forEach(prop => {
        if (!(prop in options))
            throw new Error(`displayAnnotations requires prop '${prop}'`)
    })

    const store = require('./vuex/store')
    Object.keys(options).forEach(k => {
        store.state[k] = options[k]
    })
    store.dispatch('fetchList')
        .then(() => {
            window.app = new Vue({
                store,
                el: options.el,
                template: `<anno-list ref='anno-list'/>`,
            })
        })
        .catch(err => { throw err })

}
