// Bootstrap
require('bootstrap-webpack!./bootstrap.config.js');

// Font Awesome
require('style-loader!css-loader!font-awesome/css/font-awesome.css');

// Code
window.UBHDAnnoApp = require('./src/app.js')

// XXX
// For debugging
window.Vue = require('vue')
window.Vue.config.devtools = true
window._ubhddebug = {
    Vue: window.Vue,
    xrx: require('semtonotes-client').xrx,
    goog: require('semtonotes-client').goog,
    AnnoEditor : require('./src/vue-component/anno-editor.vue.js'),
    ZoneEditor : require('./src/vue-component/zone-editor.vue.js'),
    HtmlEditor : require('./src/vue-component/html-editor.vue.js'),
    config: require('./src/config.js'),
}
