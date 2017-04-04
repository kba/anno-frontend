const AnnoClient = require('../anno-client')
module.exports = {
    props: {
        annotation: {type: Object, required: true},
        targetImage: {type: String, required: true},
        targetThumbnail: {type: String},
        l10n: {type: Object, required: true},
    },
    template: require('./anno-editor.html'),
    style: require('./anno-editor.css'),
    components: {
        'bootstrap-button': require('./bootstrap-button'),
        'bootstrap-tabs':   require('./bootstrap-tabs'),
        'bootstrap-tab':    require('./bootstrap-tab'),
        'zone-editor':      require('./zone-editor'),
        'html-editor':      require('./html-editor'),
        'tags-editor':      require('./tags-editor'),
        'semtags-editor':   require('./semtags-editor'),
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
