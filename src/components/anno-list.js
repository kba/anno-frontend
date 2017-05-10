/*
 * ### anno-list
 *
 * List of [anno-viewer](#anno-viewer) components.
 *
 * #### Events
 *
 * - `create`: A new annotation on `targetSource` shall be created
 *
 * #### Methods
 *
 * ##### `collapseAll(state)`
 *
 * - `@param {String} state` Either `show` or `hide`
 *
 */
const eventBus = require('../event-bus')

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/auth'),
        require('../mixin/api'),
        require('../mixin/prefix'),
    ],
    data() { return {
        collapsed: 'hide'
    }},
    template: require('./anno-list.html'),
    style: require('./anno-list.scss'),
    mounted() {
        if (window.sessionStorage.getItem("annolistCollapseAll") !== null) {
            this.collapsed = window.sessionStorage.getItem("annolistCollapseAll") === 'hide'
        }
        this.$watch(() => this.list, () => this.collapseAll(this.collapsed ? 'hide' : 'show'))
        this.collapseAll(this.collapsed ? 'hide' : 'show')
        this.sort()
    },
    computed: {
        sortedBy() { return this.$store.state.annotationList.sortedBy },
        list() { return this.$store.state.annotationList.list },
        targetSource() { return this.$store.state.targetSource },
        token() { return this.$store.state.token },
        purlTemplate() { return this.$store.state.purlTemplate },
        purlId() { return this.$store.state.purlId },
        isLoggedIn() { return this.$store.state.isLoggedIn },
        logoutEndpoint() { return this.$store.state.logoutEndpoint },
        loginEndpoint() { return this.$store.state.loginEndpoint },
        numberOfAnnotations() { return this.$store.getters.numberOfAnnotations },
    },
    methods: {
        logout() { this.$store.dispatch('logout') },
        create() { return eventBus.$emit('create', this.targetSource) },

        collapseAll(state) {
            this.collapsed = state === 'hide'
            this.$children.forEach(annoViewer => annoViewer.collapse && annoViewer.collapse(state))
            window.sessionStorage.setItem('annolistCollapseAll', state)
        },
        sort(...args) {
            this.$store.dispatch('sort', ...args)
        },
    },
}

