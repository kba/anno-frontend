const $ = require('jquery')

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
        this.$root.$on('open-editor', () => this.show())
        this.$root.$on('close-editor', () => this.hide())
    },
    methods: {
        save() { this.$root.$emit('save') },
        remove() { this.$root.$emit('remove', this.id) },
        discard() { this.$root.$emit('discard') },

        show() { $(this.$el).modal('show') },
        hide() { $(this.$el).modal('hide') },
    },
}
