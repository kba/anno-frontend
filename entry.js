// Vue + Vuex
window.Vue = require('vue')
window.Vuex = require('vuex')

if (process.env.NODE_ENV !== 'production') {
    window.Vue.config.devtools = true
    require('jquery-ui/ui/widgets/resizable')
    require('jquery-ui/ui/widgets/draggable')
    require('bootstrap-webpack!./bootstrap.config.js');
    require('font-awesome/css/font-awesome.css');
}


//
// Our code
//

// Register all components
require('./src/components')(window.Vue)

// Code
window.displayAnnotations = require('./src/display-annotations.js')

window._ubhddebug = {
    store: require('./src/vuex/store'),
    config: require('./src/config'),
    api: require('./src/api')({
    token: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicnQxMjZAdW5pLWhlaWRlbGJlcmcuZGUiLCJzZXJ2aWNlIjoiZGlnbGl0Iiwid3JpdGUiOjEsImV4cCI6MzE1MzYwMDAwfQ.h7WZ_gmWNv-uCjoobLCiHH_voinj8dddnjMBZsmCJ8o'
    })
}
