const $ = require('jquery')
const quill = require('quill/dist/quill.js')
require('style-loader!css-loader?minimize=true!quill/dist/quill.snow.css')

const { textualHtmlBody } = require('@kba/anno-queries')

const eventBus = require('../event-bus')

/**
 * ### html-editor
 *
 * Editor for the `text/html` `TextualBody` body of an annotation.
 *
 */

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/prefix'),
    ],
    data() { return {
        licenseInfo: [
            {
                url: 'https://creativecommons.org/publicdomain/zero/1.0/',
                img: require('../../img/CC0_button.svg'),
                title: 'Creative Commons CC0',
                desc: 'license_cc0_desc',
            },
            {
                url: 'https://creativecommons.org/licenses/by/4.0/',
                img: require('../../img/CC-BY_icon.svg'),
                title: 'Creative Commons CC-BY 4.0',
                desc: 'license_ccby_desc',
            }
        ]
    }},
    style: require('./html-editor.scss'),
    template: require('./html-editor.html'),
    mounted() {
        this.quill = new quill(this.$refs.editor, {
            modules: {
                toolbar: {
                    container: this.$refs.toolbar,
                    handlers: {
                        undo() { this.quill.history.undo() },
                        redo() { this.quill.history.redo() },
                    }
                }
            },
            placeholder: this.l10n('editor_placeholder'),
            theme: 'snow',
        });
        this.quill.on('text-change', (delta, oldDelta, source) => {
            console.log(this.$refs.editor)
            var html = this.$refs.editor.children[0].innerHTML
            if (html === '<p><br></p>') html = ''
            this.value = html
        })
        $('[data-toggle="popover"]', this.$el).popover({
            container: '.modal'
        });
        eventBus.$on('open-editor', () => this.quill.pasteHTML(this.value))
    },
    computed: {
        value: {
            get () {
                const textBody = textualHtmlBody.first(this.$store.state.editing)
                if (!textBody.value) this.$store.commit('SET_HTML_BODY_VALUE', '') 
                return textBody.value
            },
            set (content) { this.$store.commit('SET_HTML_BODY_VALUE', content) },
        },
        title: {
            get () { return this.$store.state.editing.title },
            set (value) { this.$store.commit('SET_TITLE', value) }
        },
        rights: {
            get () { return this.$store.state.editing.rights },
            set (value) { this.$store.commit('SET_RIGHTS', value) }
        },
        titleRequired() {
            return ! this.$store.state.editing.replyTo
        },
    },

}
