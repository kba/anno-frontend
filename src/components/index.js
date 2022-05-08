'use strict';

const vue2Teleport = require('vue2-teleport').default;

const components = {

    // helpers
    'bootstrap-button':  require('./bootstrap-button'),
    'bootstrap-tab':     require('./bootstrap-tab'),
    'bootstrap-tabs':    require('./bootstrap-tabs'),
    'teleport':          vue2Teleport,

    // viewing
    'anno-list':         require('./anno-list'),
    'anno-viewer':       require('./anno-viewer'),
    'anno-viewer-versions-dropdown': require('./anno-viewer-versions-dropdown'),
    'anno-viewer-thumbnail-svg': require('./anno-viewer-thumbnail-svg'),
    'clipboard-copy-button': require('./clipboard-copy-button'),
    'dt-url-caption-link': require('./dt-url-caption-link'),

    // editing
    'anno-editor-licenses':       require('./anno-editor-licenses'),
    'anno-editor-modal':          require('./anno-editor-modal'),
    'anno-editor-rows-addable':   require('./anno-editor-rows-addable'),
    'anno-editor':         require('./anno-editor'),
    'html-editor':         require('./html-editor'),
    'semtags-editor':      require('./semtags-editor'),
    'relationlink-editor': require('./relationlink-editor'),
    'tags-editor':         require('./tags-editor'),
    'xrx-vue':             require('@kba/xrx-vue').XrxVue,

    // debugging
    'anno-editor-debug-panel':    require('./anno-editor-debug-panel'),
    'json-export-import-field':   require('./json-export-import-field'),

    // apps
    'sidebar-app':       require('./sidebar-app')

};

function registerAll(Vue) {
  Object.entries(components).forEach(kv => Vue.component(...kv));
}

module.exports = { registerAll };
