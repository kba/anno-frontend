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

function isHtmlBody(body) { return body.type === 'TextualBody' && body.format === 'text/html' }


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
        created() {
            this._initialValue = this.htmlBody.value
        },
        computed: {
            htmlBody() {
                // console.log(this)
                if (!this.annotation.body) this.annotation.body = [{ type: 'TextualBody', format: 'text/html', value: '' }]
                var ret;
                if (Array.isArray(this.annotation.body)) 
                    ret = this.annotation.body.find(isHtmlBody)
                else if (isHtmlBody(this.annotation.body)) {
                    ret = this.annotation.body
                } else {
                    this.annotation.body = [this.annotation.body]
                    const newBody = { type: 'TextualBody', format: 'text/html', value: '' }
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
    })

}

module.exports = HtmlEditorComponent
