const config = require('../config')

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
            placeholder: 'Compose an epic...',
            theme: 'snow',
        });
        this.quill.on('text-change', (delta, oldDelta, source) => {
            console.log(this.$refs.editor)
            var html = this.$refs.editor.children[0].innerHTML
            if (html === '<p><br></p>') html = ''
            this.value = html
        })
        eventBus.$on('open-editor', () => this.quill.pasteHTML(this.value))
    },
    computed: {
        value: {
            get () { return (textualHtmlBody.first(this.$store.state.annotation) || {value: ''}).value },
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
