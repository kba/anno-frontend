const bonanza = require('bonanza');

module.exports = {
    template: require('./semtags-editor.html'),
    style: require('./semtags-editor.css'),
    props: {
        annotation: {type: Object, required: true},
        l10n: {type: Object, required: true},
    },
    computed: {
        bodies() {
            if (!Array.isArray(this.annotation.body)) {
                this.annotation.body = !this.annotation.body ? [] : [this.annotation.body]
            }
            return this.annotation.body.filter(body =>
                   body.motivation === 'linking'
                || body.motivation === 'identifying'
                || body.motivation === 'classifying')
        },
    },
    components: {
        'bootstrap-button': require('./bootstrap-button')
    },
    updated() {
        this.ensureCompletion()
    },
    methods: {
        ensureCompletion() {
            ;['id', 'label'].forEach(field => {
                const el = this.$el.querySelector(`input.semtags-${field}`)
                if (el.classList.contains('has-completion'))
                    return
                el.classList.add('has-completion')
                const ev = bonanza(el, (...args) => this.autocomplete(field, ...args))
                const body = this.bodies[el.dataset.bodyIndex]
                ev.on('change', (val) => { body[field] = val })
            })
        },
        autocomplete(field, query, cb) {
            if (field === 'id') return cb(null, ['http://gnd.info/1234', 'http://gnd.info/9876'])
            if (field === 'label') return cb(null, ['Bank <Institution>', 'Bank <Gebäude>', 'Bank <Sitzgelegenheit>'])
            else cb(`No such completion '${field}'`)
        },
        add() {
            console.log("Add semantic tag")
            if (!Array.isArray(this.annotation.body)) {
                this.annotation.body = !this.annotation.body ? [] : [this.annotation.body]
            }
            const newBody = {type: ['TextualBody', 'SemanticTag'], motivation: 'linking', id: '', label: ''}
            this.annotation.body.push(newBody)
        },
        remove(toDelete) {
            console.log("Delete semantic tag", toDelete)
            const toDeleteIndex = this.annotation.body.indexOf(toDelete)
            this.annotation.body.splice(toDeleteIndex, 1)
        },
    }
}
