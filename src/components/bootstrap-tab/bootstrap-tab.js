module.exports = {
    mixins: [
      require('@/mixin/l10n'),
      require('@/mixin/help-popover'),
    ],
    template: require('./bootstrap-tab.html'),
    props: {
        title:  {type: String, required: true},
        active: {type: [Boolean, String], default:false},
        name:   {type: String, required: true},
        topic:  {type: String, required: false},
    }
}
