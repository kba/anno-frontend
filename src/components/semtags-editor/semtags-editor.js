const axios = require('axios')
const bonanza = require('bonanza')
const authorities = require('@ubhd/authorities-client')
const authHelpers = authorities.utils.handlebars.helpers;
const gndClient = authorities.plugin('ubhd/gnd')

const {
  semanticTagBody,
} = require('@kba/anno-queries');

/*
 * ### semtags-editor
 *
 * Editor for *semantic* tags, i.e. link-label tuples with autocompletion.
 *
 */


function preserveUserInput(commit, ev) {
  const el = ev.target;
  const n = +el.dataset.bodyIndex;
  const userInputValue = el.value;
  const oldBodyValue = el.dataset.annoBodyValue;
  if (userInputValue === oldBodyValue) { return; }
  console.debug('SemTag input changed',
    { n, oldBodyValue, userInputValue, el, ev });
  el.dataset.semSource = '';
  commit("SET_SEMTAG_PROP", { n, prop: 'value', value: userInputValue });
  commit("SET_SEMTAG_PROP", { n, prop: 'label', value: '' });
  commit("SET_SEMTAG_PROP", { n, prop: 'source', value: '' });
}


module.exports = {
    mixins: [
        require('@/mixin/l10n'),
    ],
    template: require('./semtags-editor.html'),
    style: [
        require('./bonanza.sass'),
        require('./semtags-editor.scss'),
    ],
    computed: {
        semanticTagBodies() {
          return (this.$store.getters.semanticTagBodies || [])
        },
        language() {return this.$store.state.language},
    },
    mounted() {
      this.ensureCompletion()
      // const editor = this;
      // const addersTextFields = jq(editor.$el).find('input.semtag-value');
    },
    updated() {
      this.ensureCompletion()
    },
    methods: {
      addSemanticTag() {this.$store.commit('ADD_SEMTAG_BODY')},
      removeBody(body) {this.$store.commit('REMOVE_BODY', body)},

        ensureCompletion() {
            const editor = this;
            const getLabel = (obj) => authHelpers.preferredName(obj)
            const getSource = ({gndIdentifier}) => `https://d-nb.info/gnd/${gndIdentifier}`

            Array.from(editor.$el.querySelectorAll(`input.semtag-value`))
                .filter(el => !el.classList.contains('has-completion'))
                .forEach(el => {
                    el.classList.add('has-completion')
                    const n = el.dataset.bodyIndex
                    bonanza(
                        el,
                        {
                            templates: {
                                itemLabel(obj) { return authHelpers.helpfulPreferredName(obj) },
                                label(obj) { return getLabel(obj)}
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
                        const label = getLabel(value);
                        const source = getSource(value);
                        console.debug('SemTag label selected',
                          { n, value, label, source, el });
                        if (n === undefined) {
                          Object.assign(el.dataset, {
                            value,
                            label,
                            source,
                          });
                        } else {
                          el.dataset.annoBodyValue = label;
                          el.dataset.semSource = source;
                          // old @kba style semtags legacy compat
                          editor.$store.commit("SET_SEMTAG_PROP", {n, prop:'value', value: label})
                          editor.$store.commit("SET_SEMTAG_PROP", {n, prop:'label', value: label})
                          editor.$store.commit("SET_SEMTAG_PROP", {n, prop:'source', value: source})
                        }
                    })

                    const pui = preserveUserInput.bind(null,
                      editor.$store.commit);
                    el.onchange = pui;
                    el.onblur = pui;
                })

        },
    },
}
