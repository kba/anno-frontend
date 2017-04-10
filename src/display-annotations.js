const Vue = require('vue')

/**
 * ### `displayAnnotations(options)`
 *
 * - takes the initial state of the Vue store
 * - dispatches a `fetchToken` action to retrieve the token from localStorage
 *   or via HTTP GET to `tokenEndpoint` or fail and force login if clicked, not
 *   otherwise
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
 * @param Object tokenEndpoint URL of the endpoint providing the JSON Webtoken
 * ```
 */

module.exports = function displayAnnotations(options={}) {

    options.targetSource = options.targetSource || window.location.href

    // Set the prefix for IDs
    if (!options.prefix) options.prefix = `anno-${Date.now()}`

    // Create a container element if none was given
    if (!options.el) {
        const containerDiv = document.createElement('div')
        containerDiv.setAttribute('id', `${options.prefix}-container`)
        const appDiv = document.createElement('div')
        appDiv.setAttribute('id', `${options.prefix}-app`)
        containerDiv.appendChild(appDiv)
        document.querySelector('body').appendChild(containerDiv)
        options.el = appDiv
    }
    console.log(options.el)

    // Set up the store
    const store = require('./vuex/store')

    // Set the store options
    // NOTE This will break reactivity if the properties are unknown so make sure
    // you define defaults, even null or empty strings
    Object.keys(options).forEach(k => store.state[k] = options[k])

    store.dispatch('fetchToken').catch(err => { throw err })
    store.dispatch('fetchList').catch(err => { throw err })
    window.app = new Vue({
        store,
        el: options.el,
        template: `<anno-list ref='anno-list'/>`,
    })

}
