const Vue = require('vue')
const Vuex = require('vuex')
const eventBus = require('./event-bus')

/**
 * ### `displayAnnotations(options)`
 *
 * 1) takes the initial state of the Vue store
 * 2) dispatches a `fetchToken` action to retrieve the token from localStorage
 *    or via HTTP GET to `tokenEndpoint` or fail and force login if clicked, not
 *    otherwise
 * 3) dispatches a `fetchList` action to retrieve all anotations that match
 *    `{$target:options.targetSource}`
 * 4) dispatches a `fetchAcl` action to retrieve the resp. permissions
 * 5) starts a Vue App with a single [`<sidebar-app>`](#sidebar-app)
 * 6) Returns the Vue.App which should be kept around (e.g. as window.annoapp)
 *    and on whose `eventBus` listeners can be added `$on` and which can emit
 *    events with `$emit`
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
 *
 * - `token`: Function or token. The literal token. Don't use this option
 *   without SSL/TLS encryption. Function must be synchronous.
 * - `tokenEndpoint`: URL of the endpoint providing the JSON Webtoken
 * - `annoEndpoint`: URL of the Open Annotation Protocol server
 *
 * - `loginEndpoint`: Function or URL of the login mask
 * - `logoutEndpoint`: Function or URL that logs the user out
 * - `isLoggedIn`: Function or boolean to designate whether the is already
 *   logged in. No login button will be shown in that case
 *
 * #### Events
 *
 * - `startHighlighting(annoId)`: $emit this to highlight the annotation
 * - `stopHighlighting(annoId)`: $emit this to un-highlight the annotation 
 * - `mouseover(annoId)`: $on this to catch when an annotation is hovered in the list
 * - `mouseleave(annoId)`: $on this to catch when an annotation is un-hovered in the list
 * - `fetched(annotationList)`: List of annotations has been fetched from the server
 *
 */
module.exports = function displayAnnotations(options={}) {

    options.targetSource = options.targetSource || window.location.href

    // Set the prefix for IDs
    if (!options.prefix)
        options.prefix = `anno-${Date.now()}`

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

    // These options can also be functions to be called to produce the value now
    ;['token', 'isLoggedIn', 'loginEndpoint', 'logoutEndpoint'].forEach(fn => {
        if (typeof options[fn] === 'function') {
            options[fn] = options[fn]()
        }
    })

    // remember callbacks
    const {onLoad, onError} = options
    delete options.onLoad

    // Set up the store
    // NOTE This will break reactivity if the properties are unknown so make sure
    const storeProps = require('./vuex/store')
    Object.assign(storeProps.state, options)
    const store = new Vuex.Store(storeProps)

    // Set the store options
    // you define defaults, even null or empty strings
    // Object.keys(options).forEach(k => store.state[k] = options[k])
    // console.log(store.state.annoEndpoint)
    // console.log(store.state.annotationList.list)

    const annoapp = new Vue(Object.assign({
            store,
            el: options.el
        }, require('./components/sidebar-app.js')))

    /* globals annoap */
    annoapp.$store.dispatch('fetchToken')
        .then(annoapp.$store.dispatch('fetchList'))
        .catch(err => { if (onError) onError(err) })

    annoapp.eventBus = eventBus
    return annoapp
}
