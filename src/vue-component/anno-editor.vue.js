module.exports = {
    props: {
        annotation: {type: Object, required: true},
        targetImage: {type: String, required: true},
        targetThumbnail: {type: String},
        l10n: {type: Object, required: true},
    },
    template: require('./anno-editor.vue.html'),
    components: {
        'zone-editor': require('./zone-editor.vue.js'),
        'html-editor': require('./html-editor.vue.js'),
    },
}
