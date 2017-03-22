const Vue = require('vue')
const VueTinymce = require('vue-tinymce').default
Vue.use(VueTinymce)

/* TinyMCE */
require.context('!file?name=[path][name].[ext]&context=node_modules/tinymce!tinymce/skins', true, /.*/)
require('tinymce/tinymce');
require('tinymce/themes/modern/theme');
require('tinymce/plugins/paste');
require('tinymce/plugins/link');
require('tinymce/plugins/image');

function HtmlEditorComponent(data) {

    data.tinymce_options = data.tinymce_options || {
        plugins: 'image link',
        // selector: selector,
        language: data.language,
        toolbar: [
            'undo redo',
            'formatselect',
            'bold italic underline blockquote',
            'alignleft aligncenter alignright',
            'bullist numlist indent outdent',
            'link image',
        ].join(' | '),
        menubar: false,
        statusbar: false,
        height: 400,
        width: 350,
    }

    return Vue.component('html-editor', {
        template: require('./html-editor.vue.html'),
        data: () => data,
        methods: {
            changeHandler(editor, content) {
                console.log(data)
                // this.anno.body.value = content
            },
            activate() {
                console.log("ACTIVATED!")
                // var ed = tinymce.editors;
                // if (ed.length) {
                    // ed[0].setContent(this.anno.body.value);
                // }
                // tinymce.init();
                // Object.keys(config.tinymce_localizations).forEach(function(lang) {
                //     tinymce.addI18n(lang, config.tinymce_localizations[lang]);
                // });

            },
        },
    })

}

module.exports = HtmlEditorComponent
