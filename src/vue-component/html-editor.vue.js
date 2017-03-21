const Vue = require('vue')
const VueTinymce = require('vue-tinymce').default
Vue.use(VueTinymce)

function HtmlEditorComponent(anno) {

    anno.tinymce_options = {
        // selector: selector,
        plugins: 'image link',
        // language: language,
        toolbar: [
            'undo redo',
            'formatselect',
            'bold italic underline blockquote',
            'alignleft aligncenter alignright',
            'bullist numlist indent outdent',
            'link image',
        ].join('|'),
        menubar: false,
        statusbar: false,
        height: 400,
        width: 350,
    }

    return Vue.component('html-editor', {
        template: require('./html-editor.vue.html'),
        data: () => anno,
        methods: {
            changeHandler(editor, content) {
                console.log("STUFF CHANGED")
                console.log(arguments)
                console.log("STUFF CHANGED")
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
