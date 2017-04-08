const eventBus = require('../event-bus')
const tinymce = require('tinymce')

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/api'),
    ],
    props: {
        editorId: {type: String, default: 'ubhdannoprefix_field_text'},
    },
    template: require('./anno-editor.html'),
    style: require('./anno-editor.css'),
    created() {
        // TODO Move these to store maybe??
        eventBus.$on('create', this.create)
        eventBus.$on('comment', this.comment)
        eventBus.$on('revise', this.revise)
        eventBus.$on('remove', this.remove)
        eventBus.$on('discard', this.discard)
        eventBus.$on('save', this.save)
    },
    mounted() {
        eventBus.$on('open-editor', () => {
            const textarea = tinymce.get(this.editorId)
            const textBody = this.$store.getters.firstHtmlBody
            if (textarea && textBody) textarea.setContent(textBody.value)
        })
    },
    computed: {
        id()              { return this.$store.state.annotation.id },
        stateDump()       { return this.$store.state },
        targetImage()     { return this.$store.state.targetImage },
        targetThumbnail() { return this.$store.state.targetThumbnail },
        targetSource()    { return this.$store.state.targetSource },
    },
    methods: {
        save() {
            const anno = this.$store.state.annotation
            const cb = (err, newAnno) => {
                if (err) {
                    console.error(err)
                    return
                }
                this.$store.commit('RESET_ANNOTATION')
                this.$store.dispatch('fetchList')
                eventBus.$emit('close-editor')
            }

                 if (this.mode === 'create')  this.api.create(anno, cb)
            else if (this.mode === 'comment') this.api.comment(anno.replyTo, anno, cb)
            else if (this.mode === 'revise')  this.api.revise(anno.id, anno, cb)
        },

        discard() {
            this.$store.commit('RESET_ANNOTATION')
            eventBus.$emit('close-editor')
        },

        remove(annotation) {
            if(window.confirm(this.l10n("confirm_delete"))) {
                this.api.remove(annotation.id, (err) => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log('removed', annotation)
                        eventBus.$emit('removed', annotation)
                        this.$store.dispatch('fetchList')
                    }
                })
            }
        },

        create(annotation) {
            this.mode = 'create'
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('ADD_TARGET', this.targetSource)
            eventBus.$emit('open-editor')
        },

        comment(annotation) {
            this.mode = 'comment'
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('ADD_TARGET', annotation.id)
            this.$store.commit('ADD_MOTIVATION', 'replying')
            this.$store.commit('SET_REPLY_TO', annotation.id)
            eventBus.$emit('open-editor')
        },

        revise(annotation) {
            this.mode = 'revise'
            this.$store.commit('RESET_ANNOTATION')
            this.$store.dispatch('replaceAnnotation', annotation)
            eventBus.$emit('open-editor')
        },
    }
}
