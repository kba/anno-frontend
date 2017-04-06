// Bootstrap
require('bootstrap-webpack!./bootstrap.config.js');

// Font Awesome
require('style-loader!css-loader!font-awesome/css/font-awesome.css');

// Code
window.displayAnnotations = require('./src/display-annotations.js')

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
    api: require('./src/api/annoApi')({
        token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicnQxMjZAdW5pLWhlaWRlbGJlcmcuZGUiLCJzZXJ2aWNlIjoiZGlnbGl0Iiwid3JpdGUiOjEsImV4cCI6MzE1MzYwMDAwfQ.h7WZ_gmWNv-uCjoobLCiHH_voinj8dddnjMBZsmCJ8o'
    })
}
