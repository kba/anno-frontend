// const Vue = require('vue/dist/vue.esm.js').default;
const Vue = require('vuejs-debug-traverse-210506-pmb/vue.esm.js').default;
const Vuex = require('vuex/dist/vuex.esm.js').default;

const mergeOptions = require('merge-options');
const pEachSeries = require('p-each-series').default;

if (process.env.NODE_ENV !== 'production') {
  Vue.config.devtools = true;
  console.log('anno-frontend: Enabled Vue devtools.');
}
Vue.use(Vuex);
require('./components/index.js').registerAll(Vue);

const SidebarApp = require('./components/sidebar-app')
const eventBus = require('./event-bus')
const bootstrapCompat = require('./bootstrap-compat')
const decideDefaultOptions = require('./default-config');
const {localizations} = require('../l10n-config.json')
const externalRequest = require('./xrq/externalRequest.js')

// For docs see display-annotations.md

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
    let onAppReady;
    (function installEvents() {
      const { events } = options;
      delete options.events;
      if (!events) { return; }
      onAppReady = events.appReady;
      delete events.appReady;
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
      'collection',
      'isLoggedIn',
      'purlTemplate',
      'targetSource',
      'token',
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
    if (onAppReady) { onAppReady(annoapp); }
    annoapp.externalRequest = externalRequest.bind(null, annoapp);
    return annoapp;
}
