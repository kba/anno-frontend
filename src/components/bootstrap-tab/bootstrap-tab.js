module.exports = {
    mixins: [require('@/mixin/l10n')],
    template: require('./bootstrap-tab.html'),
    props: {
        title:  {type: String, required: true},
        active: {type: [Boolean, String], default:false},
        name:   {type: String, required: true},
        topic:  {type: String, required: false},
        tabCls:   {type: String, required: false},
        paneCls:  {type: String, required: false},
    }
}
