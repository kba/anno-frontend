const component = {

    // helpers
    'bootstrap-button':  require('./bootstrap-button'),
    'bootstrap-tab':     require('./bootstrap-tab'),
    'bootstrap-tabs':    require('./bootstrap-tabs'),

    // viewing
    'anno-list':         require('./anno-list'),
    'anno-viewer':       require('./anno-viewer'),

    // editing
    'anno-editor-modal':   require('./anno-editor-modal'),
    'anno-editor':         require('./anno-editor'),
    'html-editor':         require('./html-editor'),
    'semtags-editor':      require('./semtags-editor'),
    'relationlink-editor': require('./relationlink-editor'),
    'tags-editor':         require('./tags-editor'),
    'xrx-vue':             require('@kba/xrx-vue').XrxVue,

    // apps
    'sidebar-app':       require('./sidebar-app')

}

function registerAll(Vue) {
    Object.keys(component).forEach(name => Vue.component(name, component[name]))
}

module.exports = registerAll
