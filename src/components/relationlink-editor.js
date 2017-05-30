const bonanza = require('bonanza');

/*
 * ### relationlinks-editor
 *
 * Editor for qualified links, i.e. link-label-purpose triples.
 *
 */

module.exports = {
    mixins: [
        require('../mixin/l10n'),
    ],
    template: require('./relationlink-editor.html'),
    style:    require('./relationlink-editor.css'),
    props: {
        relations: {type: Array, default() { return [
            'http://schema.org/relatedTo',
            'http://purl.org/dc/terms/isPartOf',
            'http://purl.org/vra/basedOn',
            'http://purl.org/vra/cartoonFor',
            'http://purl.org/vra/cartoonIs',
            'http://purl.org/vra/componentIs',
            'http://purl.org/vra/componentOf',
            'http://purl.org/vra/contextIs',
            'http://purl.org/vra/copyAfter',
            'http://purl.org/vra/copyIs',
            'http://purl.org/vra/counterProofFor',
            'http://purl.org/vra/counterProofIs',
            'http://purl.org/vra/depictedIn',
            'http://purl.org/vra/depicts',
            'http://purl.org/vra/derivedFrom',
            'http://purl.org/vra/designedFor',
            'http://purl.org/vra/exhibitedAt',
            'http://purl.org/vra/facsimileIs',
            'http://purl.org/vra/facsimileOf',
            'http://purl.org/vra/formerlyLargerContextFor',
            'http://purl.org/vra/formerlyPartOf',
            'http://purl.org/vra/imageIs',
            'http://purl.org/vra/imageOf',
            'http://purl.org/vra/impressionIs',
            'http://purl.org/vra/largerContextFor',
            'http://purl.org/vra/mateOf',
            'http://purl.org/vra/modelFor',
            'http://purl.org/vra/modelIs',
            'http://purl.org/vra/partnerInSetWith',
            'http://purl.org/vra/part of',
            'http://purl.org/vra/pendantOf',
            'http://purl.org/vra/planFor',
            'http://purl.org/vra/planIs',
            'http://purl.org/vra/preparatoryFor',
            'http://purl.org/vra/printingPlateFor',
            'http://purl.org/vra/printingPlateIs',
            'http://purl.org/vra/prototypeFor',
            'http://purl.org/vra/prototypeIs',
            'http://purl.org/vra/relatedTo',
            'http://purl.org/vra/reliefFor',
            'http://purl.org/vra/replicaIs',
            'http://purl.org/vra/replicaOf',
            'http://purl.org/vra/sourceFor',
            'http://purl.org/vra/studyFor',
            'http://purl.org/vra/studyIs',
            'http://purl.org/vra/venueFor',
            'http://purl.org/vra/versionIs',
            'http://purl.org/vra/versionOf',
        ]}
    }},
    computed: {
        relationLinkBodies() { return this.$store.getters.relationLinkBodies }
    },
    methods: {
        addRelationLink() { this.$store.commit('ADD_RELATIONLINK') },
        removeBody(body) { this.$store.commit('REMOVE_BODY', body) },
        // TODO anno-utils!
        includes(maybeArray, val) {
            return Array.isArray(maybeArray) && maybeArray.includes(val)
        },
        onSelectPurpose(n, event) {
            const prop = 'purpose'
            const value = ['classifying', event.target.value]
            this.$store.commit("SET_RELATIONLINK_PROP", {n, prop, value})
        },
    }
}
