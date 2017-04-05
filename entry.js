// Bootstrap
require('bootstrap-webpack!./bootstrap.config.js');

// Font Awesome
require('style-loader!css-loader!font-awesome/css/font-awesome.css');

// Code
// window.UBHDAnnoApp = require('./src/app.js')

window.Vue = require('vue')
window.Vuex = require('vuex')

// Add vuex store
// window.Vue.use(window.Vuex)

// Enable devtools
window.Vue.config.devtools = true

// Register all components
require('./src/components')(window.Vue)

window._ubhddebug = {
    Vue: window.Vue,
    store: require('./src/vuex/store'),
    xrx: require('semtonotes-client').xrx,
    goog: require('semtonotes-client').goog,
    AnnoEditor : require('./src/components/anno-editor'),
    ZoneEditor : require('./src/components/zone-editor'),
    HtmlEditor : require('./src/components/html-editor'),
    AnnoViewer : require('./src/components/anno-viewer'),
    config: require('./src/config'),
}
