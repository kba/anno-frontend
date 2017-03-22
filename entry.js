// Bootstrap
require('bootstrap-webpack!./bootstrap.config.js');

// Font Awesome
require('style-loader!css-loader!font-awesome/css/font-awesome.css');


// Stylesheet
require('style-loader!css-loader!./css/annotations.css')

// Code
window.UBHDAnnoApp = require('./src/app.js')

// XXX
// For debugging
window._ubhddebug = {
    Vue: require('vue'),
    // EditorModal: require('./src/vue-component/zone-editor.vue.js'),
    ZoneEditorComponent : require('./src/vue-component/zone-editor.vue.js'),
    HtmlEditorComponent : require('./src/vue-component/html-editor.vue.js'),
    config: require('./src/config.js'),
}
