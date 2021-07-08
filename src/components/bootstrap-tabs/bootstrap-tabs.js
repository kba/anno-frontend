const loPick = require('lodash.pick');

const HelpButton = require('../help-button');
const BsTabComponent = require('../bootstrap-tab');

const bsTabPropNames = Object.keys(BsTabComponent.props);


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
      helpUrlTemplate:  {type: String, required: true},
      helpUrlManual:    {type: String, required: false},
    },
    mounted() {
      this.tablist = this.$children.map(c => loPick(c, bsTabPropNames));
      console.debug('tabList:', JSON.parse(JSON.stringify(this.tablist)));
    }
}
