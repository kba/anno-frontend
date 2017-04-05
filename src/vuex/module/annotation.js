const {
    ensureArray, add, remove,
    firstHtmlBody, simpleTagBodies, semanticTagBodies, svgTarget,
} = require('../../anno-utils.js')

//
// initial state
//

const state = {
    id: '',
    title: '',
    body: [],
    target: [],
    rights: '',
}

//
// getters
//

const getters = {
    firstHtmlBody,
    simpleTagBodies,
    semanticTagBodies,
    svgTarget,
}

//
// actions
//

const actions = {

    setHtmlBodyContent({commit, state}, v) {
        if (!getters.firstHtmlBody(state))
            commit('ADD_HTML_BODY')
        commit('SET_HTML_BODY', v)
    },

    setSvgSelector({commit, state}, {svg, source}) {
        if (!getters.svgTarget(state)) {
            commit('ADD_SVG_TARGET', source)
        }
        commit('SET_SVG_SELECTOR', svg)
    },

    addSimpleTag({commit, state}, v) {
        commit('ADD_TAG_BODY')
    },

    addSemanticTag({commit, state}, v) {
        commit('ADD_SEMTAG_BODY')
    },

    replaceAnnotation({commit, state}, newState) {
        commit('REPLACE_ANNOTATION', newState)
    },

    removeBody({commit, state}, v) {
        commit('REMOVE_BODY', v)
    },

    removeTarget({commit, state}, v) {
        commit('REMOVE_TARGET', v)
    },

}

//
// mutations
//

const mutations = {

    ADD_TAG_BODY(state, body={type: 'TextualBody', motivation: 'tagging', value: ''}) {
        ensureArray(state, 'body')
        add(state, 'body', body)
    },

    ADD_SEMTAG_BODY(state, body={motivation: 'linking', id: ''}) {
        ensureArray(state, 'body')
        add(state, 'body', body)
    },

    ADD_SVG_TARGET(state, source) {
        ensureArray(state, 'target')
        add(state, 'target', {source, selector: {type: 'SvgSelector', value: ''}})
    },

    SET_SVG_SELECTOR(state, svg) {
        getters.svgTarget(state).selector.value = svg
    },

    SET_TITLE(state, title) {
        state.title = title
    },

    REMOVE_TARGET(state, v) {
        remove(state, 'target', v)
    },

    REMOVE_BODY(state, v) {
        remove(state, 'body', v)
    },

    REPLACE_ANNOTATION(state, newState) {
        // Object.assign(state, newState)
        Object.keys(state).forEach(k => {
            if (newState[k]) state[k] = newState[k]
            else state[k] = null
        })
    },

    ADD_HTML_BODY(state, body={type: 'TextualBody', format: 'text/html', value: ''}) {
        add(state, 'body', body)
    },

    SET_HTML_BODY(state, v) {
        getters.firstHtmlBody(state).value = v
    },

    SET_SEMTAG_PROP(state, {n, prop, value}) {
        getters.semanticTagBodies(state)[n][prop] = value
    },

    SET_ANNO_PROP(state, {prop, value}) {
        state[prop] = value
    }


}

module.exports = {
    state,
    actions,
    getters,
    mutations,
}
