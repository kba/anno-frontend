const HelpButton = require('@/components/help-button')

module.exports = {
    mixins: [require('@/mixin/l10n')],
    template: require('./bootstrap-tabs.html'),
    style: require('./bootstrap-tabs.scss'),
    components: {HelpButton},
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
    props: {
      language:        {type: String, required: true},
      helpUrlTemplate: {type: String, required: true},
      helpUrlManual: {type: String, required: false},
    },
    mounted() {
        this.$children.forEach( c => {
            this.tablist.push({
                name: c.name,
                title: c.title,
                active: c.active,
                topic: c.topic,
            })
        })
    }
}
