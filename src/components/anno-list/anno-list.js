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
const eventBus = require('@/event-bus')
const HelpButton = require('@/components/help-button')
const $ = require('jquery')
const bootstrapCompat = require('../../bootstrap-compat');

module.exports = {
    mixins: [
        require('@/mixin/l10n'),
        require('@/mixin/auth'),
        require('@/mixin/api'),
        require('@/mixin/prefix'),
    ],
    components: {HelpButton},
    data() {return {
        collapsed: 'hide',
        bootstrapOpts: bootstrapCompat.sharedConfig,
    }},
    template: require('./anno-list.html'),
    style: require('./anno-list.scss'),
    mounted() {

        // Collapse/Expand all according to setting
        if (window.sessionStorage.getItem("annolistCollapseAll") !== null) {
            this.collapsed = window.sessionStorage.getItem("annolistCollapseAll") === 'hide'
        }
        this.$watch(() => this.list, () => this.collapseAll(this.collapsed ? 'hide' : 'show'))
        this.collapseAll(this.collapsed ? 'hide' : 'show')

        // enable popovers
        $('[data-toggle="popover"]', this.$el).popover()

        // Sort the list initially and after every fetch
        this.sort()
        eventBus.$on('fetched', () => this.sort())

        // When permissions have been updated, force an update.
        eventBus.$on('updatedPermissions', () => this.$forceUpdate())

        // Initially open the list if there was an annotation persistently adressed
        if (this.purlId && this.purlAnnoInitiallyOpen) {
            eventBus.$once('fetched', () => {
                setTimeout(() => eventBus.$emit('expand', this.purlId), 1)
            })
        }
    },
    computed: {
        sortedBy() {return this.$store.state.annotationList.sortedBy},
        list() {return this.$store.state.annotationList.list},

        targetSource() {return this.$store.state.targetSource},
        token() {return this.$store.state.token},
        purlTemplate() {return this.$store.state.purlTemplate},
        purlId() {return this.$store.state.purlId},
        purlAnnoInitiallyOpen() {return this.$store.state.purlAnnoInitiallyOpen},
        numberOfAnnotations() {return this.$store.getters.numberOfAnnotations},

        isLoggedIn() {return this.$store.getters.isLoggedIn},
        enableLogoutButton() {return this.$store.state.enableLogoutButton},
        enableRequestButton() {return this.$store.state.enableRequestButton},
        enableRegisterButton() {return this.$store.state.enableRegisterButton},
        logoutEndpoint() {return this.$store.state.logoutEndpoint},
        registerEndpoint() {return this.$store.state.registerEndpoint},
        requestEndpoint() {return this.$store.state.requestEndpoint},
        loginEndpoint() {return this.$store.state.loginEndpoint},
        tokenDecoded() {return this.$store.getters.tokenDecoded},
    },
    methods: {
        logout() {return this.$store.dispatch('logout')},
        sort(...args) {return this.$store.dispatch('sort', ...args)},
        create() {return eventBus.$emit('create', this.targetSource)},

        collapseAll(state) {
            this.collapsed = state === 'hide'
            this.$children.forEach(annoViewer => annoViewer.collapse && annoViewer.collapse(state))
            window.sessionStorage.setItem('annolistCollapseAll', state)
        },
    },
}

