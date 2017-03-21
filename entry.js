// Bootstrap
require('bootstrap-webpack!./bootstrap.config.js');

// Font Awesome
require('style-loader!css-loader!font-awesome/css/font-awesome.css');

// TinyMCE
require.context(
  '!file?name=[path][name].[ext]&context=node_modules/tinymce!tinymce/skins', 
  true, 
  /.*/
)

require('tinymce/tinymce');

// A theme is also required
require('tinymce/themes/modern/theme');

// Any plugins you want to use has to be imported
require('tinymce/plugins/paste');
require('tinymce/plugins/link');


// Stylesheet
require('style-loader!css-loader!./css/annotations.css')

// Code
window.UBHDAnnoApp = require('./src/annotations.js')

// XXX
// For debugging
window._ubhddebug = {
    Vue: require('vue'),
    ZoneEditorComponent : require('./src/vue-component/zone-editor.vue.js'),
    HtmlEditorComponent : require('./src/vue-component/html-editor.vue.js'),
    config: require('./src/config.js'),
}
