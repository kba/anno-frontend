const axios = require('axios')
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
            const bestLabel = (obj) => obj.label[this.language] || obj.label.de || obj.label.en || obj.label
            Array.from(this.$el.querySelectorAll(`input.semtag-value`))
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
                        (...args) => this.autocomplete(...args)
                    ).on('change', (value) => {
                        this.$store.commit("SET_SEMTAG_PROP", {n, prop:'source', value: value.url})
                        this.$store.commit("SET_SEMTAG_PROP", {n, prop:'label', value:bestLabel(value)})
                    })
                })
        },

        _normdatenResponseToAutocomplete(docs) {
            return docs.map(doc => {
                return {
                    url: `http://d-nb.info/gnd/${doc.gndIdentifier}`,
                    label: {
                        de: `${doc.preferredName} (${doc._type})`
                    }
                }
            })
        },

        _normdatenSuggestToAutocomplete(docs) {
            return docs.map(doc => {
                return {
                    url: `http://d-nb.info/gnd/${doc.payload}`,
                    label: {
                        de: `${doc.term}`
                    },
                }
            })
        },

        /**
         * @param String prop The property to autocomplete. Either 'source' or 'label'
         */
        autocomplete(query, cb) {
            if (!query.search)
                return cb(null, [])
            // axios.get(`http://pers42.ub.uni-heidelberg.de:8888/gnd/?q=${query.search}&suggest=true&offset=${query.offset}&limit=${query.limit}`)
            // XXX this is with the regular search API which returns wrapped solr docs
            //     .then(resp => cb(null, this._normdatenResponseToAutocomplete(resp.data.response.docs)))
                // .then(resp => cb(null, this._normdatenSuggestToAutocomplete(resp.data.docs)))
            //     .catch(err => cb(err))
            const types = [
                "Country",
                "AdministrativeUnit",
                "TerritorialCorporateBodyOrAdministrativeUnit",
                "MemberState",
                "DifferentiatedPerson",
                "UndifferentiatedPerson",
            ]
            const q = `${query.search} AND _type:(${types.map(t => `"${t}"`).join(' ')})`
            axios.get(`http://pers42.ub.uni-heidelberg.de:8888/gnd/?q=${encodeURIComponent(q)}`)
                .then(resp => cb(null, this._normdatenResponseToAutocomplete(resp.data.response.docs)))
                .catch(err => cb(err))
        },
    },
}
