module.exports = {
    mixins: [require('../mixin/l10n')],
    template: require('./bootstrap-tabs.html'),
    data() {
        return {
            tablist: []
        }
    },
    methods: {
        clickHandler(ev) {
            this.$emit('shown.bs.tab', ev)
        }
    },
    mounted() {
        this.$children.forEach( c => {
            this.tablist.push({
                name: c.name,
                title: c.title,
                active: c.active
            })
        })
    }
}
