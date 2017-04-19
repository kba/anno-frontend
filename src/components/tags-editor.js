/**
 * ### tags-editor
 *
 * Editor for the simple text-value-only tags of an annotation.
 *
 */
module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/prefix'),
    ],
    template: require('./tags-editor.html'),
    computed: {
        simpleTagBodies() { return this.$store.getters.simpleTagBodies },
    },
    methods: {
        addSimpleTag() { this.$store.commit('ADD_SIMPLE_TAG') },
        removeBody(body) { this.$store.commit('REMOVE_BODY', body) },
    }
}
