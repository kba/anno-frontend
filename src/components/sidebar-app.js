const $ = require('jquery')

module.exports = {
    mixins: [
        require('../mixin/prefix'),
        require('../mixin/l10n'),
    ],
    style: require('./sidebar-app.scss'),
    template: require('./sidebar-app.html'),
    data() { return {
        collapsed: false,
    }},
    computed: {
        numberOfAnnotations() { return this.$store.getters.numberOfAnnotations },
    },
    methods: {

        toggle() {
            this.collapsed = !this.collapsed;
            this[this.collapsed ? 'hide' : 'show']()
        },

        show() {
            $('[data-toggle="collapse"]', this.$el).removeClass('collapsed')
            $('.anno-sidebar-body').removeClass('hidden')
            $('.anno-sidebar-body').removeClass('hidden-print')
        },

        hide() {
            $('[data-toggle="collapse"]', this.$el).addClass('collapsed')
            $('.anno-sidebar-body').addClass('hidden')
            $('.anno-sidebar-body').addClass('hidden-print')
        },
    }
}
