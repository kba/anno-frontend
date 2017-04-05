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
    store: require('./src/vuex/store'),
    config: require('./src/config'),
}
