const Vue = require('vue')
const Vuex = require('vuex')
Vue.use(Vuex)
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
 * - `container`: Container element to hold the annotation sidebar/modal
 * - `language`: Language for l10n. Currently: `en`/`eng` or `de`/`deu` (Default)
 * - `collection`: Anno Collection
 * - `targetSource`: The target of the annotation. Defaults to `window.location.href`
 * - `targetImage`: The image if any, to annotate on this page
 * - `targetThumbnail`: Thumbnail view of the image. Defaults to `options.targetImage`
 * - `annotationList`: Options for the list display
 *   - `sortedBy`:     Sort key: `created_az`, `created_za` or `title_az`
 *   - `allCollapsed`: Collapse (`true`) or expand (`false`) all annotations
 * - `purlTemplate` A string template for the persistent URL. `{{ slug }}` will
 *   be replaced by the slug of the annotation
 * - `purlId` Annotation ID of the persistent URL. Should begin with the URL of `annoEndpoint`
 * - `purlAnnoInitiallyOpen` Whether the persistently adressed annotation
 *   should be made visible initially, if necessary by opening parent threads
 *
 * - `token`: Function or token. The literal token. Don't use this option
 *   without SSL/TLS encryption. Function must be synchronous.
 * - `tokenEndpoint`: URL of the endpoint providing the JSON Webtoken
 * - `annoEndpoint`: URL of the Open Annotation Protocol server
 *
 * - `loginEndpoint`: Function or URL of the login mask
 * - `logoutEndpoint`: Function or URL that logs the user out
 * - `isLoggedIn`: Function or boolean to designate whether the user is already
 *   logged in. No login button will be shown in that case, token will still be
 *   retrieved unless found
 *
 * #### Methods
 *
 * ##### `startHighlighting(annoId, open)`
 *
 * Highlight the annotation with `id` annoId
 * 
 * ##### `stopHighlighting(annoId)`
 *
 * Stop highlighting the annotation with `id` annoId
 *
 * ##### `expand(annoId)`
 *
 * Open thread tree to reveal anno with id `annoId`
 * 
 * #### Events
 * 
 * Either listen/emit via app.eventBus and/or provide listeners as `events` option
 * 
 * - `mouseover(annoId)`: $on this to catch when an annotation is hovered in the list
 * - `mouseleave(annoId)`: $on this to catch when an annotation is un-hovered in the list
 * - `fetched(annotationList)`: List of annotations has been fetched from the server
 *
 */
module.exports = function displayAnnotations(options={}) {

    const SidebarApp = require('./components/sidebar-app.js')
    SidebarApp.props.standalone.default = ! options.container
    SidebarApp.props.collapseInitially.default = !! options.collapseInitially

    options.targetSource = options.targetSource || window.location.href

    //
    // Set the prefix for IDs
    //
    if (!options.prefix)
        options.prefix = `anno-${Date.now()}`

    //
    // Create a container element if none was given
    //
    let container = options.container
    if (!container) {
        container = document.createElement('div')
        container.setAttribute('id', `${options.prefix}-container`)
        document.querySelector('body').appendChild(container)
    }
    const appDiv = document.createElement('div')
    appDiv.setAttribute('id', `${options.prefix}-app`)
    container.appendChild(appDiv)
    const el = appDiv

    //
    // Event listeners
    //
    const eventListeners = options.events ? options.events : {}
    Object.keys(eventListeners).forEach(event => {
        //console.log(`Binding "${event}" event on`, eventBus, 'to', eventListeners[event])
        eventBus.$on(event, (...args) => eventListeners[event](...args))
    })
    delete options.events

    // These options can also be functions to be called to produce the value now
    ;['token', 'collection', 'isLoggedIn', 'loginEndpoint', 'logoutEndpoint'].forEach(fn => {
        if (typeof options[fn] === 'function') {
            options[fn] = options[fn]()
        }
    })

    //
    // Set up the store
    //
    // NOTE This will break reactivity if the properties are unknown so make sure
    // you define defaults, even null or empty strings
    const storeProps = require('./vuex/store')
    Object.assign(storeProps.state, options)
    const store = new Vuex.Store(storeProps)

    const annoapp = new Vue(Object.assign({store, el}, SidebarApp))

    //
    // Store reference to the eventBus
    //
    annoapp.eventBus = eventBus

    //
    // Convenience methods for startHighlighting / stopHighlighting event emission
    //
    annoapp.startHighlighting = function(...args) { eventBus.$emit('startHighlighting', ...args) }
    annoapp.stopHighlighting = function(...args) { eventBus.$emit('stopHighlighting', ...args) }
    annoapp.expand = function(...args) { eventBus.$emit('expand', ...args) }

    //
    // Kick off fetching tokens/list/ACL rules
    //
    annoapp.$store.dispatch('fetchToken')
        .then(annoapp.$store.dispatch('fetchList'))
        .catch(err => {
            // console.error("Error with initial fetchToken/fetchList", err)
            annoapp.eventBus.$emit('error', err)
        })

    //
    // Return the app for event emitting
    //
    return annoapp
}
