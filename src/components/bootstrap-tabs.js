module.exports = {
    mixins: [require('../mixin/l10n')],
    template: require('./bootstrap-tabs.html'),
    data() {
        return {
            tablist: []
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
