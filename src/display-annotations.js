const Vue = require('vue')

/**
 * ### `displayAnnotations(options)`
 *
 * - takes the initial state of the Vue store
 * - dispatches a `fetchList` action to retrieve all anotations that match
 *   `{$target:options.targetSource}` and the resp. permissions
 * - starts a Vue App with a single <anno-sidebar>
 *
 * ```
 * @param Object options
 * @param DOMElement options.el Element to hold the annotation sidebar/modal
 * @param String language Language for l10n. Currently: `en`/`eng` or `de`/`deu` (Default)
 * @param String targetSource The target of the annotation. Defaults to `window.location.href`
 * @param String targetImage The image if any, to annotate on this page
 * @param String targetThumbnail Thumbnail view of the image. Defaults to `options.targetImage`
 * @param Object annotationList Options for the list display
 * @param String annotationList.sortedBy     Sort key: `date`, `datereverse` or `title`
 * @param String annotationList.allCollapsed Collapse (`true`) or expand (`false`) all annotations
 * ```
 */

module.exports = function displayAnnotations(el, options={}) {

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
