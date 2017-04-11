const tinymce = require('tinymce')
const css = require('./anno-editor.css')
console.log(css)

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/api'),
        require('../mixin/prefix'),
    ],
    props: {
        editorId: {type: String, default: 'anno-editor'},
    },
    template: require('./anno-editor.html'),
    style: css,
    created() {
        // TODO Move these to store maybe??
        this.$root.$on('create', this.create)
        this.$root.$on('reply', this.reply)
        this.$root.$on('revise', this.revise)
        this.$root.$on('remove', this.remove)
        this.$root.$on('discard', this.discard)
        this.$root.$on('save', this.save)
    },
    mounted() {
        this.$root.$on('open-editor', () => {
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
                this.$root.$emit('close-editor')
            }

                 if (this.mode === 'create')  this.api.create(anno, cb)
            else if (this.mode === 'reply') this.api.reply(anno.replyTo, anno, cb)
            else if (this.mode === 'revise')  this.api.revise(anno.id, anno, cb)
        },

        discard() {
            this.$store.commit('RESET_ANNOTATION')
            this.$root.$emit('close-editor')
        },

        remove(annotation) {
            if(window.confirm(this.l10n("confirm_delete"))) {
                this.api.delete(annotation.id, (err) => {
                    if (err) {
                        console.error(err)
                    } else {
                        console.log('removed', annotation)
                        this.$root.$emit('removed', annotation)
                        this.$store.dispatch('fetchList')
                    }
                })
            }
        },

        create(annotation) {
            this.mode = 'create'
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('ADD_TARGET', this.targetSource)
            this.$root.$emit('open-editor')
        },

        reply(annotation) {
            this.mode = 'reply'
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('ADD_TARGET', annotation.id)
            this.$store.commit('ADD_MOTIVATION', 'replying')
            this.$store.commit('SET_REPLY_TO', annotation.id)
            this.$root.$emit('open-editor')
        },

        revise(annotation) {
            this.mode = 'revise'
            this.$store.commit('RESET_ANNOTATION')
            this.$store.dispatch('replaceAnnotation', annotation)
            this.$root.$emit('open-editor')
        },
    }
}
