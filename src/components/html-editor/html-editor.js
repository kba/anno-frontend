const quill = require('quill/dist/quill.js')

// const { textualHtmlBody } = require('@kba/anno-queries')

const eventBus = require('@/event-bus')

/**
 * ### html-editor
 *
 * Editor for the `text/html` `TextualBody` body of an annotation.
 *
 */

module.exports = {
    mixins: [
        require('@/mixin/l10n'),
        require('@/mixin/prefix'),
    ],
    style: [
      require('quill/dist/quill.snow.css'),
      require('./html-editor.scss'),
    ],
    template: require('./html-editor.html'),
    mounted() {
        const {l10n} = this
        this.quill = new quill(this.$refs.editor, {
            modules: {
                toolbar: {
                    container: this.$refs.toolbar,
                    handlers: {
                        undo() {this.quill.history.undo()},
                        redo() {this.quill.history.redo()},
                        image() {
                          const value = window.prompt(l10n("image.prompt.url"))
                          if (!value) {return}
                          // // TODO
                          // if (!value.match(/^https?:\/\/heidicon/)) {
                          //   window.alert("Domain not allowed :(")
                          // }
                          this.quill.insertEmbed(
                            this.quill.getSelection().index,
                            'image',
                            value,
                            quill.sources.USER)
                        },
                    }
                }
            },
            placeholder: this.l10n('editor_placeholder'),
            theme: 'snow',
        })
        this.quill.on('text-change', (delta, oldDelta, source) => {
            // console.debug('HTML editor text change in:', this.$refs.editor);
            let html = this.$refs.editor.children[0].innerHTML
            if (html === '<p><br></p>') html = ''
            this.value = html
        })
        eventBus.$on('open-editor', () => this.quill.pasteHTML(this.value))
        eventBus.$on('close-editor', () => this.quill.pasteHTML(''))
    },
    computed: {
        firstHtmlBody() {return this.$store.getters.firstHtmlBody},
        value: {
            get () {
                const {firstHtmlBody} = this
                // console.log({firstHtmlBody})
                return firstHtmlBody && firstHtmlBody.value ? firstHtmlBody.value : ''
            },
            set (content) {this.$store.commit('SET_HTML_BODY_VALUE', content)},
        },
    },

}
