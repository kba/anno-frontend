const axios = require('axios')
const bonanza = require('bonanza')
const gndClient = require('@ubhd/authorities-client').plugin('ubhd/gnd')

/*
 * ### semtags-editor
 *
 * Editor for *semantic* tags, i.e. link-label tuples with autocompletion.
 *
 */

module.exports = {
    mixins: [
        require('@/mixin/l10n'),
    ],
    template: require('./semtags-editor.html'),
    style:    require('./bonanza.sass'),
    computed: {
        semanticTagBodies() {return this.$store.getters.semanticTagBodies},
        language() {return this.$store.state.language},
    },
    updated() {
        this.ensureCompletion()
    },
    methods: {
        addSemanticTag() {this.$store.commit('ADD_SEMTAG_BODY')},
        removeBody(body) {this.$store.commit('REMOVE_BODY', body)},
        ensureCompletion() {
            const label = ({term}) => term[this.language] || term.de || term.en || term
            const source = ({payload}) => payload.startsWith('http') ? payload : `http://d-nb.info/gnd/${payload}`

            Array.from(this.$el.querySelectorAll(`input.semtag-value`))
                .filter(el => !el.classList.contains('has-completion'))
                .forEach(el => {
                    el.classList.add('has-completion')
                    const n = el.dataset.bodyIndex
                    bonanza(
                        el,
                        {
                            templates: {
                                item(obj) {return label(obj)},
                            }
                        },
                        function(query, cb) {
                            if (!(query && query.search)) return cb(null, [])
                            gndClient.suggest(query.search, {
                                types: [
                                    "Country",
                                    "AdministrativeUnit",
                                    "TerritorialCorporateBodyOrAdministrativeUnit",
                                    "MemberState",
                                    "DifferentiatedPerson",
                                    "UndifferentiatedPerson",
                                ],
                                count: query.limit
                            })
                                .then(results => cb(null, results.suggestions))
                                .catch(err => cb(err))
                        }
                    ).on('change', (value) => {
                        this.$store.commit("SET_SEMTAG_PROP", {n, prop:'source', value: source(value)})
                        this.$store.commit("SET_SEMTAG_PROP", {n, prop:'label', value: label(value)})
                    })
                })

        },
    },
}

// vim: sw=4 ts=4
