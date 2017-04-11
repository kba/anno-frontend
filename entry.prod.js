// Vue + Vuex
window.Vue = require('vue')
window.Vuex = require('vuex')

// Register all components
require('./src/components')(window.Vue)

// Code
window.displayAnnotations = require('./src/display-annotations.js')
