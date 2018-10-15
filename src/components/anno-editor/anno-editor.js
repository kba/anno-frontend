const eventBus      = require('@/event-bus')

/*
 * ### anno-editor
 *
 * The editor has three modes: `create`, `reply` and `revise` that represent
 * the function of the anno-store to be used on `save`
 *
 * Properties:
 *
 * Events:
 *
 * - `close-editor`: The editor was closed
 * - `removed(id)`: Annotation `id` was removed
 *
 */

module.exports = {
    mixins: [
        require('@/mixin/l10n'),
        require('@/mixin/api'),
        require('@/mixin/prefix'),
    ],
    template: require('./anno-editor.html'),
    style: require('./anno-editor.scss'),
    props: {
        editorId: {type: String, default: 'anno-editor'},
        enableTabTags: {type: Boolean, default: false},
    },
    created() {
        // TODO Move these to store maybe??
        eventBus.$on('create', this.create)
        eventBus.$on('reply', this.reply)
        eventBus.$on('revise', this.revise)
        eventBus.$on('remove', this.remove)
        eventBus.$on('discard', this.discard)
        eventBus.$on('save', this.save)
        eventBus.$on('open-editor', () => {
            if (this.targetImage) {
                this.zoneEditor.reset()
                this.zoneEditor.loadImage(this.targetImage)
            }
        })
    },
    mounted() {
        if (this.targetImage) {
            this.zoneEditor.$on('load-image', () => {
                this.loadSvg()
                this.zoneEditor.$on('svg-changed', svg => {
                    this.$refs.preview.$refs.thumbnail.reset()
                    this.$refs.preview.$refs.thumbnail.loadSvg(this.svgTarget.selector.value)
                })
            })
        }
    },
    computed: {
        id()              {return this.$store.state.editing.id},
        stateDump()       {return this.$store.state},
        targetImage()     {return this.$store.state.targetImage},
        editMode()        {return this.$store.state.editMode},
        targetThumbnail() {return this.$store.state.targetThumbnail},
        targetSource()    {return this.$store.state.targetSource},
        svgTarget()       {return this.$store.getters.svgTarget},
        zoneEditor()      {return this.$refs.zoneEditor},
    },
    methods: {
        save() {
            const anno = this.$store.state.editing
            if (!anno.title && this.editMode == 'create') {
                window.alert("A title is required")
                return
            }
            const cb = (err, newAnno) => {
                if (err) {
                    console.error("Error saving annotation", err)
                    return
                }
                this.$store.dispatch('fetchList')
                this.$store.commit('RESET_ANNOTATION')
                eventBus.$emit('close-editor')
            }

                 if (this.editMode === 'create') this.api.create(anno, cb)
            else if (this.editMode === 'reply')  this.api.reply(anno.replyTo, anno, cb)
            else if (this.editMode === 'revise') this.api.revise(anno.id, anno, cb)
        },

        loadSvg() {
            const svg = (this.svgTarget && this.svgTarget.selector.value) ? this.svgTarget.selector.value : false
            // console.log({svg})
            if (svg) this.zoneEditor.loadSvg(svg)
        },

        discard() {
            this.$store.commit('RESET_ANNOTATION')
            eventBus.$emit('close-editor')
        },

        remove(annotation) {
            if (window.confirm(this.l10n("confirm_delete"))) {
                this.api.delete(annotation.id, (err) => {
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
            this.$store.commit('SET_EDIT_MODE', 'create')
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('SET_COLLECTION', this.$store.state.collection)
            this.$store.commit('ADD_TARGET', this.targetSource)
            eventBus.$emit('open-editor')
        },

        reply(annotation) {
            this.$store.commit('SET_EDIT_MODE', 'reply')
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('SET_COLLECTION', this.$store.state.collection)
            this.$store.commit('SET_HTML_BODY_VALUE', '')
            this.$store.commit('ADD_TARGET', {id: annotation.id, scope: this.targetSource})
            this.$store.commit('ADD_MOTIVATION', 'replying')
            this.$store.commit('SET_REPLY_TO', annotation.id)
            eventBus.$emit('open-editor')
        },

        revise(annotation) {
            this.$store.commit('SET_EDIT_MODE', 'revise')
            this.$store.commit('SET_COLLECTION', this.$store.state.collection)
            this.$store.commit('RESET_ANNOTATION')
            this.$store.commit('REPLACE_ANNOTATION', annotation)
            eventBus.$emit('open-editor')
        },

        onSvgChanged(svg) {
            this.$store.commit('SET_SVG_SELECTOR', {svg, source: this.$store.state.targetImage})
        }
    }
}
