const Vue = require('vue')

/**
 * ### `displayAnnotations(options)`
 *
 * 1) takes the initial state of the Vue store
 * 2) dispatches a `fetchToken` action to retrieve the token from localStorage
 *   or via HTTP GET to `tokenEndpoint` or fail and force login if clicked, not
 *   otherwise
 * 3) dispatches a `fetchList` action to retrieve all anotations that match
 *   `{$target:options.targetSource}`
 * 4) dispatches a `fetchAcl` action to retrieve the resp. permissions
 * 5) starts a Vue App with a single <anno-list in a toggleable sidebar>
 *
 * #### Options
 *
 * - `el`: Element to hold the annotation sidebar/modal
 * - `language`: Language for l10n. Currently: `en`/`eng` or `de`/`deu` (Default)
 * - `targetSource`: The target of the annotation. Defaults to `window.location.href`
 * - `targetImage`: The image if any, to annotate on this page
 * - `targetThumbnail`: Thumbnail view of the image. Defaults to `options.targetImage`
 * - `annotationList`: Options for the list display
 *   - `sortedBy`:     Sort key: `date`, `datereverse` or `title`
 *   - `allCollapsed`: Collapse (`true`) or expand (`false`) all annotations
 * - `tokenEndpoint`: URL of the endpoint providing the JSON Webtoken
 * - `loginEndpoint`: URL of the login mask
 * - `logoutEndpoint`: URL that logs the user out
 *
 * #### Events
 *
 * - `startHighlighting(annoId)`: $emit this to highlight the annotation
 * - `stopHighlighting(annoId)`: $emit this to un-highlight the annotation 
 * - `mouseover(annoId)`: $on this to catch when an annotation is hovered in the list
 * - `mouseleave(annoId)`: $on this to catch when an annotation is un-hovered in the list
 *
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

    // Set up the store
    const store = require('./vuex/store')

    // Set the store options
    // NOTE This will break reactivity if the properties are unknown so make sure
    // you define defaults, even null or empty strings
    Object.keys(options).forEach(k => store.state[k] = options[k])

    store.dispatch('fetchToken').catch(err => { throw err })
    store.dispatch('fetchList').then(() =>
            store.dispatch('fetchAcl').catch(err => { throw err })
        ).catch(err => { throw err })

    window.annoapp = new Vue(Object.assign({
            store,
            el: options.el
        }, require('./components/sidebar-app.js')))
    return window.annoapp

}
