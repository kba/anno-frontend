const $ = require('jquery')
const eventBus = require('../event-bus')

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/auth'),
        require('../mixin/prefix'),
    ],
    template: require('./anno-editor-modal.html'),
    computed: {
        id() { return this.$store.state.annotation.id },
        editor() { return this.$refs['editor'] },
    },
    created() {
        eventBus.$on('open-editor', () => this.show())
        eventBus.$on('close-editor', () => this.hide())
    },
    methods: {
        save() { eventBus.$emit('save') },
        remove() { eventBus.$emit('remove', this.id) },
        discard() { eventBus.$emit('discard') },

        show() { $(this.$el).modal('show') },
        hide() { $(this.$el).modal('hide') },
    },
}
