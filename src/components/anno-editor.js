const AnnoClient = require('../anno-client')
module.exports = {
    props: {
        targetImage: {type: String, required: true},
        targetThumbnail: {type: String},
        l10n: {type: Object, required: true},
    },
    template: require('./anno-editor.html'),
    style: require('./anno-editor.css'),
    mounted() {
        this.client = AnnoClient.instance
    },
    computed: {
        id() { return this.$store.state.id },
        stateDump() { return this.$store.state },
    },
    methods: {
        save() {
            console.log("Save called")
            this.client.createOrRevise(this.$store.state)
                .then(resp => this.$store.commit('replace', resp.data))
                .catch(err => console.log("ERROR", err))
        }
    },
}
