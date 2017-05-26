const bonanza = require('bonanza');

/*
 * ### semtags-editor
 *
 * Editor for *semantic* tags, i.e. link-label tuples with autocompletion.
 *
 */

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/prefix'),
    ],
    template: require('./semtags-editor.html'),
    style:    require('./semtags-editor.css'),
    props: {
        relations: {type: Array, default() { return [
            'http://purl.org/dc/terms/isPartOf',
            'http://purl.org/vra/cartoonFor',
            'http://purl.org/vra/cartoonIs',
            'http://purl.org/vra/componentOf',
            'http://purl.org/vra/componentIs',
            'http://purl.org/vra/copyAfter',
            'http://purl.org/vra/copyIs',
            'http://purl.org/vra/counterProofFor',
            'http://purl.org/vra/counterProofIs',
            'http://purl.org/vra/depicts',
            'http://purl.org/vra/depictedIn',
            'http://purl.org/vra/derivedFrom',
            'http://purl.org/vra/sourceFor',
            'http://purl.org/vra/designedFor',
            'http://purl.org/vra/contextIs',
            'http://purl.org/vra/exhibitedAt',
            'http://purl.org/vra/venueFor',
            'http://purl.org/vra/facsimileOf',
            'http://purl.org/vra/facsimileIs',
            'http://purl.org/vra/formerlyPartOf',
            'http://purl.org/vra/formerlyLargerContextFor',
            'http://purl.org/vra/imageOf',
            'http://purl.org/vra/imageIs',
            'http://purl.org/vra/mateOf',
            'http://purl.org/vra/mateOf',
            'http://purl.org/vra/modelFor',
            'http://purl.org/vra/modelIs',
            'http://purl.org/vra/part of',
            'http://purl.org/vra/largerContextFor',
            'http://purl.org/vra/partnerInSetWith',
            'http://purl.org/vra/partnerInSetWith',
            'http://purl.org/vra/pendantOf',
            'http://purl.org/vra/pendantOf',
            'http://purl.org/vra/planFor',
            'http://purl.org/vra/planIs',
            'http://purl.org/vra/preparatoryFor',
            'http://purl.org/vra/basedOn',
            'http://purl.org/vra/printingPlateFor',
            'http://purl.org/vra/printingPlateIs',
            'http://purl.org/vra/prototypeFor',
            'http://purl.org/vra/prototypeIs',
            'http://purl.org/vra/relatedTo',
            'http://purl.org/vra/relatedTo',
            'http://purl.org/vra/reliefFor',
            'http://purl.org/vra/impressionIs',
            'http://purl.org/vra/replicaOf',
            'http://purl.org/vra/replicaIs',
            'http://purl.org/vra/studyFor',
            'http://purl.org/vra/studyIs',
            'http://purl.org/vra/versionOf',
            'http://purl.org/vra/versionIs',
        ]}
    }},
    updated() {
        this.ensureCompletion()
    },
    computed: {
        semanticTagBodies() { return this.$store.getters.semanticTagBodies }
    },
    methods: {
        addSemanticTag() { this.$store.commit('ADD_SEMTAG_BODY') },
        removeBody(body) { this.$store.commit('REMOVE_BODY', body) },
        // TODO anno-utils!
        includes(maybeArray, val) {
            return Array.isArray(maybeArray) && maybeArray.includes(val)
        },
        onSelectPurpose(n, event) {
            const prop = 'purpose'
            const value = ['classifying', event.target.value]
            this.$store.commit("SET_SEMTAG_PROP", {n, prop, value})
        },
        ensureCompletion() {
            ;['source', 'value'].forEach(prop => {
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
            if (prop === 'source') return cb(null, ['http://gnd.info/1234', 'http://gnd.info/9876'])
            if (prop === 'value') return cb(null, ['Bank <Institution>', 'Bank <Gebäude>', 'Bank <Sitzgelegenheit>'])
            else cb(`No such completion '${prop}'`)
        },
    }
}
