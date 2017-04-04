const bonanza = require('bonanza');

module.exports = {
    template: require('./semtags-editor.html'),
    style: require('./semtags-editor.css'),
    props: {
        l10n: {type: Object, required: true},
    },
    computed: {
        semanticTagBodies() { return this.$store.getters.semanticTagBodies },
    },
    updated() {
        this.ensureCompletion()
    },
    methods: {
        ensureCompletion() {
            ;['id', 'label'].forEach(field => {
                const el = this.$el.querySelector(`input.semtags-${field}`)
                if (!el || el.classList.contains('has-completion'))
                    return
                el.classList.add('has-completion')
                const ev = bonanza(el, (...args) => this.autocomplete(field, ...args))
                const body = this.semanticTagBodies[el.dataset.bodyIndex]
                ev.on('change', (val) => { body[field] = val })
            })
        },
        autocomplete(field, query, cb) {
            if (field === 'id') return cb(null, ['http://gnd.info/1234', 'http://gnd.info/9876'])
            if (field === 'label') return cb(null, ['Bank <Institution>', 'Bank <Gebäude>', 'Bank <Sitzgelegenheit>'])
            else cb(`No such completion '${field}'`)
        },
        add() {
            this.$store.commit('addSemanticTag')
        },
        remove(body) {
            this.$store.commit('removeBody', body)
        },
    }
}
