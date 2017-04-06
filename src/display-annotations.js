const Vue = require('vue')
const {collectIds} = require('./anno-utils')
const annoApiFactory = require('./api/annoApi')

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
    const api = annoApiFactory(options)

    api.search({'target.source': options.targetSource}, (err, list) => {
        if (err) throw err
        store.commit('REPLACE_LIST', list)

        const allids = collectIds(list)
        allids.push(options.targetSource)

        api.aclCheck(allids, (err, perms) => {
            if (err) throw err
            store.commit('CHANGE_ACL', perms)
            const app = new Vue({
                store,
                el: options.el,
                template: `<anno-list/>`,
            })
        })
    })

}
