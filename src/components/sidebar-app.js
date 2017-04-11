module.exports = {
    props: {
        collapseInitially: {type: Boolean, default: false},
    },
    mixins: [
        require('../mixin/prefix'),
        require('../mixin/l10n'),
    ],
    style: require('./sidebar-app.scss'),
    template: require('./sidebar-app.html'),
    data() { return {
        collapsed: this.collapseInitially,
    }},
    computed: {
        numberOfAnnotations() { return this.$store.getters.numberOfAnnotations },
    },
    methods: {
        toggle() { this.collapsed = !this.collapsed },
    }
}
