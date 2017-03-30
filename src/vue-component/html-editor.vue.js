const config = require('../config')

/* TinyMCE */
require.context('!file?name=[path][name].[ext]&context=node_modules/tinymce!tinymce/skins', true, /.*/)
require('tinymce/tinymce');
require('tinymce/themes/modern/theme');
require('tinymce/plugins/paste');
require('tinymce/plugins/link');
require('tinymce/plugins/image');

/* register vue-tinymce component */
const Vue = require('vue')
const VueTinymce = require('vue-tinymce').default
Vue.use(VueTinymce)

            function isHtmlBody(body) { return body.type === 'TextualBody' && body.format === 'text/html' }

module.exports = {
    template: require('./html-editor.vue.html'),
    props: {
        annotation: {type: Object, required: true},
        l10n: {type: Object, required: true},
        language: {type: String, default: 'de'},
        tinymceOptions: {
            type: Object,
            default: () => {return {
                plugins: 'image link',
                // language: data.language,
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
            }}
        },
    },
    created() {
        this._initialValue = this.htmlBody.value
        this.tinymceOptions.language = this.language

        // Add localizations by faking a URI since tinymce expects languages at
        // a certain place but can be overridden with language_url
        this.tinymceOptions.language_url = `data:text/javascript;charset=UTF-8,tinymce.addI18n('${this.language}',${
            JSON.stringify(config.tinymce_localizations[this.language])
        });`
    },
    computed: {
        htmlBody() {

            // console.log(this)
            var ret;
            const newBody = { type: 'TextualBody', format: 'text/html', value: '' }
            if (!this.annotation.body) {
                this.annotation.body = [newBody]
                ret = newBody
            } else if (Array.isArray(this.annotation.body)) {
                ret = this.annotation.body.find(isHtmlBody)
                if (!ret) {
                    this.annotation.body.push(newBody)
                    ret = newBody
                }
            } else if (isHtmlBody(this.annotation.body)) {
                ret = this.annotation.body
            } else {
                this.annotation.body = [this.annotation.body]
                this.annotation.body.push(newBody)
                ret = newBody
            }
            return ret
        },
    },
    methods: {
        onChange(editor, content) {
            this.htmlBody.value = content
        },
        initialValue() {
            return this._initialValue;
        },
    },

}
