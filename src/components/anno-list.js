/*
 * ### anno-list
 *
 * List of [anno-viewer](#anno-viewer) components.
 *
 * #### Props
 *
 * - `collapseInitially`: Whether all annotations should be collapsed or not
 *
 * #### Events
 *
 * - `create`: A new annotation on `targetSource` shall be created
 *
 */

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/auth'),
        require('../mixin/api'),
        require('../mixin/prefix'),
    ],
    props: {
        collapseInitially: {type: Boolean, default: false},
    },
    data() { return {
        // TODO
        options: {},
        collapsed: this.collapseInitially
    }},
    template: require('./anno-list.html'),
    style: require('./anno-list.scss'),
    mounted() {
        this.sort()
    },
    computed: {
        sortedBy() { return this.$store.state.annotationList.sortedBy },
        list() { return this.$store.state.annotationList.list },
        targetSource() { return this.$store.state.targetSource },
        token() { return this.$store.state.token },
        isLoggedIn() { return this.$store.state.isLoggedIn },
        logoutEndpoint() { return this.$store.state.logoutEndpoint },
        loginEndpoint() { return this.$store.state.loginEndpoint },
        numberOfAnnotations() { return this.$store.getters.numberOfAnnotations },
    },
    methods: {
        login() { this.$store.dispatch('login') },
        logout() { this.$store.dispatch('logout') },
        create() {
            this.$root.$emit('create', this.targetSource)
        },
        collapseAll(state) {
            this.$children.forEach(annoViewer =>
                annoViewer.collapse && annoViewer.collapse(state)
            )
            this.collapsed = ! this.collapsed
        },
        sort(...args) {
            this.$store.dispatch('sort', ...args)
        },
    },
}

