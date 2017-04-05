const bonanza = require('bonanza');

module.exports = {
    template: require('./semtags-editor.html'),
    style:    require('./semtags-editor.css'),
    props: {
        l10n: {type: Object, required: true},
    },
    updated() {
        this.ensureCompletion()
    },
    computed: {
        semanticTagBodies() { return this.$store.getters.semanticTagBodies },
    },
    methods: {
        addSemanticTag() { this.$store.dispatch('addSemanticTag') },
        removeBody(body) { this.$store.dispatch('removeBody', body) },
        ensureCompletion() {
            ;['id', 'label'].forEach(prop => {
                Array.from(this.$el.querySelectorAll(`input.semtags-${prop}`))
                    .filter(el => !el.classList.contains('has-completion'))
                    .forEach(el => {
                        el.classList.add('has-completion')
                        const n = el.dataset.bodyIndex
                        bonanza(el, (...args) =>
                            this.autocomplete(prop, ...args)
                        ).on('change', (value) => {
                            this.$store.commit("SET_SEMTAG_PROP", {n, prop, value})
                        })
                    })
            })
        },
        autocomplete(prop, query, cb) {
            if (prop === 'id') return cb(null, ['http://gnd.info/1234', 'http://gnd.info/9876'])
            if (prop === 'label') return cb(null, ['Bank <Institution>', 'Bank <Gebäude>', 'Bank <Sitzgelegenheit>'])
            else cb(`No such completion '${prop}'`)
        },
    }
}
