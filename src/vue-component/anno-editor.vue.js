const AnnoClient = require('../anno-client')
module.exports = {
    props: {
        annotation: {type: Object, required: true},
        targetImage: {type: String, required: true},
        targetThumbnail: {type: String},
        l10n: {type: Object, required: true},
    },
    template: require('./anno-editor.vue.html'),
    components: {
        'bootstrap-button': require('./bootstrap-button.vue.js'),
        'bootstrap-tabs':   require('./bootstrap-tabs.vue.js'),
        'bootstrap-tab':    require('./bootstrap-tab.vue.js'),
        'zone-editor':      require('./zone-editor.vue.js'),
        'html-editor':      require('./html-editor.vue.js'),
        'tag-editor':       require('./tag-editor.vue.js'),
    },
    mounted() {
        this.client = AnnoClient.instance
    },
    methods: {
        save() {
            console.log("Save called")
            this.client.createOrRevise(this.annotation)
                .then(resp => this.annotation = resp.data)
                .catch(err => console.log("ERROR", err))
        }
    },
}
