module.exports = {
    mixins: [require('../mixin/l10n')],
    template: require('./tags-editor.html'),
    computed: {
        simpleTagBodies() { return this.$store.getters.simpleTagBodies },
    },
    methods: {
        addSimpleTag() { this.$store.dispatch('addSimpleTag') },
        removeBody(body) { this.$store.dispatch('removeBody', body) },
    }
}
