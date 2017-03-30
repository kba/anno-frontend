module.exports = {
    props: ['on-click', 'glyphicon', 'title', 'font-awesome', 'src', 'alt'],
    template: require('./zone-editor-button.vue.html'),
    methods: {
        clickHandler(event) {
            this.$parent[this.onClick](event)
        },
    }
}
