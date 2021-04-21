/*
 * ### sidebar-app
 *
 * Container for the list of annotations for a target and a modal editor to
 * edit/create new annotations.
 *
 * #### Props
 *
 * - `collapseInitially`: Whether the annotation list should be collapsed after loading
 * - `standalone`: Whether the sidebar should inject it's own
 *   toggleing/container elements or reuse existing DOM elements. If the
 *   latter, `el` must be set. See [`displayAnnotations`](#displayannotations)
 *
 *
 */
module.exports = {
    props: {
        collapseInitially: {type: Boolean, default: false},
        standalone: {type: Boolean, default: false},
    },
    mixins: [
        require('@/mixin/prefix'),
        require('@/mixin/l10n'),
    ],
    style: require('./sidebar-app.scss'),
    template: require('./sidebar-app.html'),
    data() {return {
        collapsed: this.collapseInitially,
        bootstrapOpts: this.bootstrapOpts,
    }},
    computed: {
        numberOfAnnotations() {return this.$store.getters.numberOfAnnotations},
    },
    methods: {
        toggle() {this.collapsed = !this.collapsed},
    }
}
