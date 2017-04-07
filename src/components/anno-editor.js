const eventBus = require('../event-bus')
const tinymce = require('tinymce')

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/api'),
    ],
    template: require('./anno-editor.html'),
    style: require('./anno-editor.css'),
    created() {
        // TODO Move these to store maybe??
        eventBus.$on('create', (annotation) => {
            this.mode = 'create'
            this.$store.dispatch('replaceAnnotation', {target: this.targetSource})
            eventBus.$emit('open-editor')
        })
        eventBus.$on('comment', (annotation) => {
            this.mode = 'comment'
            this.$store.dispatch('replaceAnnotation', {target: annotation.id, replyTo: annotation.id})
            eventBus.$emit('open-editor')
        })
        eventBus.$on('revise', (annotation) => {
            this.mode = 'revise'
            this.$store.dispatch('replaceAnnotation', annotation)
            eventBus.$emit('open-editor')
        })
        eventBus.$on('remove', (annotation) => {
            if(window.confirm(this.l10n("confirm_delete"))) {
                this.api.remove(annotation.id, (err) => {
                    if (err) throw err
                    console.info(`Deleted ${annotation}`)
                    eventBus.$emit('removed', annotation)
                })
            }
        })
        eventBus.$on('save', () => {
            this.save()
        })
    },
    mounted() {
        eventBus.$on('open-editor', () => {
            const textarea = tinymce.get('ubhdannoprefix_field_text')
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
                if (err) throw(err)
                this.$store.dispatch('replaceAnnotation', newAnno)
            }
                 if (this.mode === 'create')  this.api.create(anno, cb)
            else if (this.mode === 'comment') this.api.comment(anno.target, anno, cb)
            else if (this.mode === 'revise')  this.api.revise(anno.id, anno, cb)
        },
    }
}
