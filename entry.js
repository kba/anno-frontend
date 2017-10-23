// Vue + Vuex
window.Vue = require('vue')
window.Vuex = require('vuex')

if (process.env.NODE_ENV !== 'production') {
    // require('jquery-ui/ui/widgets/resizable')
    // require('jquery-ui/ui/widgets/draggable')
    // require('bootstrap-webpack!./bootstrap.config.js');
    // require('font-awesome/css/font-awesome.css');
    window.Vue.config.devtools = true
}

//
// Our code
//

// Register all components
require('./src/components')(window.Vue)

// Code
window.displayAnnotations = require('./src/display-annotations.js')

window._ubhddebug = {
  store: require('./src/vuex/store')
}
