const $ = require('jquery')
const quill = require('quill/dist/quill.js')
require('style-loader!css-loader?minimize=true!quill/dist/quill.snow.css')

// const { textualHtmlBody } = require('@kba/anno-queries')

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
        licenseInfo: require('../../license-config'),
    }},
    style: require('./html-editor.scss'),
    template: require('./html-editor.html'),
    mounted() {
        $('[data-toggle="popover"]', this.$el).popover({
            container: '#license-select'
        });
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
        eventBus.$on('open-editor', () => this.quill.pasteHTML(this.value))
        eventBus.$on('close-editor', () => this.quill.pasteHTML(''))
    },
    computed: {
        firstHtmlBody() { return this.$store.getters.firstHtmlBody },
        value: {
            get () {
                const {firstHtmlBody} = this
                // console.log({firstHtmlBody})
                return firstHtmlBody && firstHtmlBody.value ? firstHtmlBody.value : ''
            },
            set (content) { this.$store.commit('SET_HTML_BODY_VALUE', content) },
        },
        title: {
            get () { return this.$store.state.editing.title },
            set (value) { this.$store.commit('SET_TITLE', value) }
        },
        titleRequired() {
            return ! this.$store.state.editing.replyTo
        },
    },

}
