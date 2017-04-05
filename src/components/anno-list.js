const AnnoClient = require('../anno-client')
module.exports = {
    props: {
        l10n:                {type: Object, required: true},
        purl:                {type: String, required: true},
        initialAllCollapsed: {type: Boolean, default: false},
    },
    data() { return {
        // TODO
        options: {},
        allCollapsed: this.initialAllCollapsed
    }},
    template: require('./anno-list.html'),
    // style: require('./anno-list.css'),
    mounted() {
        this.sort()
    },
    computed: {
        sortedBy() { return this.$store.state.annotationList.sortedBy },
        list() { return this.$store.state.annotationList.list },
    },
    methods: {
        collapseAll(state) {
            this.$children.forEach(annoViewer => annoViewer.collapse(state))
            this.allCollapsed = ! this.allCollapsed
        },
        sort(...args) {
            this.$store.dispatch('sort', ...args)
        },
    },
}

