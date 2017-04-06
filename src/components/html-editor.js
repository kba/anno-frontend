const config = require('../config')
const l10nMixin = require('../mixin/l10n')

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

module.exports = {
    mixins: [require('../mixin/l10n')],
    template: require('./html-editor.html'),
    props: {
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
            set (content) { this.$store.dispatch('setHtmlBodyContent', content) },
        },
        title: {
            get () { return this.$store.state.annotation.title },
            set (value) { this.$store.commit('SET_ANNO_PROP', {prop: 'title', value}) }
        },
        rights: {
            get () { return this.$store.state.annotation.rights },
            set (value) { this.$store.commit('SET_ANNO_PROP', {prop: 'rights', value}) }
        },
    },

}
