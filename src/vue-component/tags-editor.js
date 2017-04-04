module.exports = {
    template: require('./tags-editor.html'),
    props: {
        l10n: {type: Object, required: true},
    },
    computed: {
        simpleTagBodies() { return this.$store.getters.simpleTagBodies },
    },
    methods: {
        add() {
            this.$store.commit('addSimpleTag')
        },
        remove(body) {
            this.$store.commit('removeBody', body)
        },
    }
}
