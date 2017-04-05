const $ = require('jquery')
const eventBus = require('../event-bus')

module.exports = {
    props: {
        targetImage: {type: String, required: true},
        targetThumbnail: {type: String},
        l10n: {type: Object, required: true},
    },
    template: require('./anno-editor-modal.html'),
    created() {
        eventBus.$on('edit', (annotation) => {
            this.$store.dispatch('replaceAnnotation', annotation)
            this.show()
            eventBus.$emit('replaced')
        })
    },
    computed: {
        id() { return this.$store.state.annotation.id },
    },
    methods: {
        show() {
            $(this.$el).modal('show')
            const was = this.$store.getters.firstHtmlBody.value
            this.$store.getters.firstHtmlBody.value = ''
            this.$store.getters.firstHtmlBody.value = was
        },
        save() {
            console.log("Save called")
            this.client.createOrRevise(this.$store.state.annotation)
                .then(resp => this.$store.commit('replace', resp.data))
                .catch(err => console.log("ERROR", err))
        }
    },
}
