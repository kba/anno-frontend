module.exports = {
    props: {
        onClick: String,
        glyphicon: String,
        title: String,
        fontAwesome: String,
        src: String,
        alt: String,
        btnSize: {type: String, default: 'sm'},
        btnClass: {type: String, default: 'default'},
    },
    template: require('./bootstrap-button.vue.html'),
    methods: {
        clickHandler(event) {
            this.$parent[this.onClick](event)
        },
    }
}
