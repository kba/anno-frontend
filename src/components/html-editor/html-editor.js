const $ = require('jquery')
const quill = require('quill/dist/quill.js')
require('style-loader!css-loader?minimize=true!quill/dist/quill.snow.css')

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
    data() {return {
      licenseInfo: require('@/../license-config')
    }},
    style: require('./html-editor.scss'),
    template: require('./html-editor.html'),
    mounted() {
        $('[data-toggle="popover"]', this.$el).popover({
            container: '#license-select'
        })
        Array.from(this.$el.querySelectorAll('[data-help-topic]')).map(helpPopover => {
            const url = this.$store.state.helpUrlTemplate
                .replace('{{ language }}', this.$store.state.language)
                .replace('{{ topic }}', helpPopover.dataset.helpTopic)
            console.log(this.$store.state)
            $(helpPopover).popover({
                html: true,
                container: 'body',
                content() {
                    fetch(url)
                        .then(resp => resp.text())
                        .then(data => $(`#help-popover-content`).html(data))
                        .catch(err => console.log(err))
                    return '<div id="help-popover-content">Loading ...</div>'
                }
            })
        })
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
            console.log(this.$refs.editor)
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
        title: {
            get () {return this.$store.state.editing.title},
            set (value) {this.$store.commit('SET_TITLE', value)}
        },
        titleRequired() {
            return ! this.$store.state.editing.replyTo
        },
    },

}
