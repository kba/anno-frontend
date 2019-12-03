const axios = require('axios')
const bonanza = require('bonanza')
const authorities = require('@ubhd/authorities-client')
const authHelpers = authorities.utils.handlebars.helpers;
const gndClient = authorities.plugin('ubhd/gnd')

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
            const label = (obj) => authHelpers.preferredName(obj)
            const source = ({gndIdentifier}) => `https://d-nb.info/gnd/${gndIdentifier}`

            Array.from(this.$el.querySelectorAll(`input.semtag-value`))
                .filter(el => !el.classList.contains('has-completion'))
                .forEach(el => {
                    el.classList.add('has-completion')
                    const n = el.dataset.bodyIndex
                    bonanza(
                        el,
                        {
                            templates: {
                                itemLabel(obj) { return authHelpers.helpfulPreferredName(obj) },
                                label(obj) { return label(obj)}
                            },
                            limit: 50,
                            hasMoreItems(result) {
                                return !!result.numFound && ( (result.start + result.docs.length) < result.numFound )
                            },
                            getItems(result) {
                                return result.docs
                            }
                        },
                        function(query, cb) {
                            if (!(query && query.search)) return cb(null, [])
                            gndClient.search(query.search, {
                                types: [
                                    "Country",
                                    "AdministrativeUnit",
                                    "TerritorialCorporateBodyOrAdministrativeUnit",
                                    "MemberState",
                                    "DifferentiatedPerson",
                                    "UndifferentiatedPerson",
                                ],
                                count: query.limit,
                                offset: query.offset,
                                queryLevel: 0
                            })
                                .then(results => cb(null, results.response))
                                .catch(err => cb(err))
                        }
                    ).on('change', (value) => {
                        this.$store.commit("SET_SEMTAG_PROP", {n, prop:'source', value: source(value)})
                        this.$store.commit("SET_SEMTAG_PROP", {n, prop:'label', value: label(value)})
                        this.$store.commit("SET_SEMTAG_PROP", {n, prop:'value', value: label(value)})
                    })
                })

        },
    },
}

// vim: sw=4 ts=4
