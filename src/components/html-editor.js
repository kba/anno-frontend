const config = require('../config')
const l10nMixin = require('../mixin/l10n')

/* register vue-tinymce component */
const Vue = require('vue')
const VueTinymce = require('vue-tinymce').default
Vue.use(VueTinymce)

/**
 * ### html-editor
 *
 * Editor for the `text/html` `TextualBody` body of an annotation.
 *
 * #### Props
 *
 * - `language`: Language of the tinymce UI. Default: `de`
 * - **`editorId`**: HTML id of the tinymce editor. Required.
 * - `tinymceOptions`: Options passed to the tinymce constructor.
 */

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/prefix'),
    ],
    template: require('./html-editor.html'),
    props: {
        language: {type: String, default: 'de'},
        editorId: {type: String, required: true},
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
                width: '100%',
            }}
        },
    },
    created() {
        console.log(this)
        this.tinymceOptions.language = this.language

        // Add localizations by faking a URI since tinymce expects languages at
        // a certain place but can be overridden with language_url
        this.tinymceOptions.language_url = `data:text/javascript;charset=UTF-8,tinymce.addI18n('${this.language}',${
            JSON.stringify(config.tinymce_localizations[this.language])
        });`
    },
    computed: {
        value: {
            get () { return this.$store.getters.firstHtmlBody ? this.$store.getters.firstHtmlBody.value : '' },
            set (content) { this.$store.commit('SET_HTML_BODY_VALUE', content) },
        },
        title: {
            get () { return this.$store.state.annotation.title },
            set (value) { this.$store.commit('SET_TITLE', value) }
        },
        rights: {
            get () { return this.$store.state.annotation.rights },
            set (value) { this.$store.commit('SET_RIGHTS', value) }
        },
    },

}
