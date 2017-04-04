// Bootstrap
require('bootstrap-webpack!./bootstrap.config.js');

// Font Awesome
require('style-loader!css-loader!font-awesome/css/font-awesome.css');

// Code
window.UBHDAnnoApp = require('./src/app.js')

window.Vue = require('vue')
window.Vuex = require('vuex')

// Add vuex store
// window.Vue.use(window.Vuex)

// Enable devtools
window.Vue.config.devtools = true

// Register all components
require('./src/vue-component')(window.Vue)

window._ubhddebug = {
    Vue: window.Vue,
    store: {
        annotation: require('./src/store/annotation')
    },
    xrx: require('semtonotes-client').xrx,
    goog: require('semtonotes-client').goog,
    AnnoEditor : require('./src/vue-component/anno-editor'),
    ZoneEditor : require('./src/vue-component/zone-editor'),
    HtmlEditor : require('./src/vue-component/html-editor'),
    AnnoViewer : require('./src/vue-component/anno-viewer'),
    config: require('./src/config'),
}
