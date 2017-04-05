const AnnoClient = require('../anno-client')
const eventBus = require('../event-bus')
const tinymce = require('tinymce')

module.exports = {
    mixins: [require('./l10n-mixin')],
    props: {
        targetImage: {type: String, required: true},
        targetThumbnail: {type: String},
    },
    template: require('./anno-editor.html'),
    style: require('./anno-editor.css'),
    mounted() {
        this.client = AnnoClient.instance
        eventBus.$on('replaced', () => {
            const textarea = tinymce.get('ubhdannoprefix_field_text')
            if (textarea) textarea.setContent(this.$store.getters.firstHtmlBody.value)
        })
    },
    beforeUpdate() {
    },
    computed: {
        id() { return this.$store.state.annotation.id },
        stateDump() { return this.$store.state },
    },
    methods: {
    },
}
