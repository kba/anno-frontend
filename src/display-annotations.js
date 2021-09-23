const Vue = require('vue').default;
const Vuex = require('vuex').default;
const mergeOptions = require('merge-options');
const pEachSeries = require('p-each-series').default;

Vue.use(Vuex)

const SidebarApp = require('./components/sidebar-app')
const eventBus = require('./event-bus')
const bootstrapCompat = require('./bootstrap-compat')
const decideDefaultOptions = require('./default-config');
const {localizations} = require('../l10n-config.json')
const externalRequest = require('./xrq/externalRequest.js')

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
module.exports = function displayAnnotations(customOptions) {
    // console.debug('displayAnnotations: customOptions =', customOptions);
    const options = mergeOptions(decideDefaultOptions(), customOptions);
    bootstrapCompat.initialize(options.bootstrap);
    delete options.bootstrap;

    Object.assign(SidebarApp.props, {
      standalone: { default: !options.container },
      collapseInitially: { default: Boolean(options.collapseInitially) },
    });

    //
    // Override l10n
    //
    if (options.l10n) {
      console.log("Overriding l10n")
        Object.keys(localizations).forEach(lang => {
            if (lang in options.l10n) {
                Object.assign(localizations[lang], options.l10n[lang])
            }
        })
        delete options.l10n
    }

    //
    // Create a container element if none was given
    //
    let container = options.container;
    delete options.container;
    if (typeof container === 'string') {
      container = container.replace(/^…/, options.prefix);
      container = document.getElementById(container);
    }
    if (!container) {
        container = document.createElement('div')
        container.setAttribute('id', options.prefix + 'container')
        document.body.appendChild(container);
    }
    const appDiv = document.createElement('div')
    appDiv.setAttribute('id', options.prefix + 'app')
    container.appendChild(appDiv);

    //
    // Event listeners
    //
    (function installEvents() {
      const { events } = options;
      delete options.events;
      if (!events) { return; }
      Object.entries(events).forEach(function install([evName, evHandler]) {
        eventBus.$on(evName, evHandler);
      });
    }());

    (function evaluateFactoryOptions(optNames) {
      // These options can also be functions to be called to produce
      // the value now.
      optNames.forEach(function check(key) {
        const oldValue = options[key];
        if (typeof oldValue === 'function') { options[key] = oldValue(); }
      });
    }([
      'token',
      'collection',
      'isLoggedIn',
      'loginEndpoint',
      'logoutEndpoint',
    ]));

    //
    // Set up the store
    //
    // NOTE This will break reactivity if the properties are unknown so make sure
    // you define defaults, even null or empty strings
    const storeProps = require('./vuex/store')
    Object.assign(storeProps.state, options)
    const store = new Vuex.Store(storeProps)

    const annoapp = new Vue(Object.assign({store, el: appDiv}, SidebarApp))

    //
    // Store reference to the eventBus
    //
    annoapp.eventBus = eventBus

    //
    // Convenience methods for startHighlighting / stopHighlighting event emission
    //
    annoapp.startHighlighting = function(...args) {eventBus.$emit('startHighlighting', ...args)}
    annoapp.stopHighlighting = function(...args) {eventBus.$emit('stopHighlighting', ...args)}
    annoapp.expand = function(...args) {eventBus.$emit('expand', ...args)}

    //
    // Kick off fetching tokens/list/ACL rules
    //
    setTimeout(async function init() {
      pEachSeries([
        'fetchToken',
        'fetchList',
        'fetchAcl',
      ], async function dare(phase) {
        try {
          await annoapp.$store.dispatch(phase);
        } catch (err) {
          err.appInitPhase = phase;
          err.message += '; phase: ' + phase;
          annoapp.eventBus.$emit('error', err);
        }
      });
    }, 1);

    //
    // Return the app for event emitting
    //
    if (options.exportAppAsWindowProp) {
      window[options.exportAppAsWindowProp] = annoapp;
    }
    if (options.onAppReady) { options.onAppReady(annoapp); }
    annoapp.externalRequest = externalRequest.bind(null, annoapp);
    return annoapp;
}
