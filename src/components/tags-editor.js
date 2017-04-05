module.exports = {
    template: require('./tags-editor.html'),
    props: {
        l10n: {type: Object, required: true},
    },
    computed: {
        simpleTagBodies() { return this.$store.getters.simpleTagBodis },
    },
    methods: {
        addSimpleTag() { this.$store.dispatch('addSimpleTag') },
        removeBody(body) { this.$store.dispatch('removeBody', body) },
    }
}
