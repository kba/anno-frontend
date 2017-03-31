module.exports = {
    template: require('./bootstrap-tab.vue.html'),
    props: {
        title:  {type: String, required: true},
        active: {type: [Boolean,String], default:false},
        name:   {type: String, required: true}
    }
}
