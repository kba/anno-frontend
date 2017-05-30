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
    ],
    template: require('./semtags-editor.html'),
    style:    require('./semtags-editor.css'),
    computed: {
        semanticTagBodies() { return this.$store.getters.semanticTagBodies },
        language() { return this.$store.state.language },
    },
    updated() {
        this.ensureCompletion()
    },
    methods: {
        addSemanticTag() { this.$store.commit('ADD_SEMTAG_BODY') },
        removeBody(body) { this.$store.commit('REMOVE_BODY', body) },
        ensureCompletion() {
            const bestLabel = (obj) => obj.label[this.language] || obj.label.de || obj.label.en

            ;['value'].forEach(prop => {
                Array.from(this.$el.querySelectorAll(`input.semtag-${prop}`))
                    .filter(el => !el.classList.contains('has-completion'))
                    .forEach(el => {
                        el.classList.add('has-completion')
                        const n = el.dataset.bodyIndex
                        bonanza(
                            el, {
                                templates: {
                                    item: (obj) => `${bestLabel(obj)}`
                                }
                            },
                            (...args) => {
                                this.autocomplete(prop, ...args)
                            }
                        ).on('change', (value) => {
                            this.$store.commit("SET_SEMTAG_PROP", {n, prop:'source', value: value.url})
                            this.$store.commit("SET_SEMTAG_PROP", {n, prop:'label', value:bestLabel(value)})
                        })
                    })
            })
        },
        autocomplete(prop, query, cb) {
            console.log(prop, query)
            if (prop === 'value') return cb(null, [
                {
                    url: 'http://gnd/term2734',
                    label: {
                        de: 'Bank <Institution>',
                        en: 'Bank <Institution>'
                    }
                },
                {
                    url: 'http://gnd/term28319321',
                    label: {
                        de: 'Bank <Gebäude>',
                        en: 'Bank <Building>'
                    }
                }
            ])
            else cb(`No such completion '${prop}'`)
        },
    },
}
