function isHtmlBody(body) { return body && body.type === 'TextualBody' && body.format === 'text/html' }
function firstHtmlBody(state) {
  if (Array.isArray(state.body)) return state.body.find(isHtmlBody)
  else if (isHtmlBody(state.body)) return state.body
}

function ensureArray(state, k) {
    if (!Array.isArray(state[k]))
        state[k] = state[k] === undefined ? [] : [state[k]]
}

function add(state, k, newBody) {
    state[k].push(newBody)
    return newBody
}

function isSimpleTagBody(body) { return body && body.motivation === 'tagging' }
function simpleTagBodies(state) {
    if (Array.isArray(state.body)) return state.body.filter(isSimpleTagBody)
    else if (isSimpleTagBody(state.body)) return [state.body]
}

function isSemanticTagBody(body) { return body && (
    body.motivation === 'linking' || body.motivation === 'identifying' || body.motivation === 'classifying')
}
function semanticTagBodies(state) {
    if (Array.isArray(state.body)) return state.body.filter(isSemanticTagBody)
    else if (isSemanticTagBody(state.body)) return [state.body]
}

//
// SvgSelector / Zoning
//
function isSvgTarget(t) { return t && t.selector && t.selector.type === 'SvgSelector' }

function svgTarget(state) {
    if (Array.isArray(state.target)) return state.target.find(isSvgTarget)
    else if (isSvgTarget(state.target)) return state.target
}

function createSvgTarget(state, source) {
    ensureArray(state, 'target')
    return add(state, 'target', {source, selector: {type: 'SvgSelector', value: ''}})
}

function setSvgSelector(state, svg) {
    svgTarget(state).selector.value = svg
}


function setTitle(state, title) { state.title = title }

function setRights(state, v) { state.rights = v }

function addSimpleTag(state, v) {
    ensureArray(state, 'body')
    add(state, 'body', {type: 'TextualBody', motivation: 'tagging', value: ''})
}

function addSemanticTag(state, v) {
    ensureArray(state, 'body')
    add(state, 'body', {motivation: 'linking', id: ''})
}

function removeBody(state, v) {
    if (Array.isArray(state.body)) {
        var vIndex = state.body.indexOf(v)
        state.body.splice(vIndex, 1)
    } else if (state.body === v) {
        state.body = []
    }
}

function setHtmlBodyContent(state, v) { 
    var body = firstHtmlBody(state)
    if (!body) {
        body = {type: 'TextualBody', format: 'text/html', value: ''}
        ensureArray(state, 'body')
        add(state, 'body', body)
    }
    body.value = v
}

function replace(state, newState) {
    Object.assign(state, newState)
}

const state = {
    id: '',
    title: '',
    body: [],
    target: [],
    rights: '',
}

const getters = {
    firstHtmlBody,
    simpleTagBodies,
    semanticTagBodies,
    svgTarget,
}

const mutations = {
    add,
    ensureArray,
    setTitle,
    setRights,
    addSimpleTag,
    addSemanticTag,
    removeBody,
    setHtmlBodyContent,
    createSvgTarget,
    setSvgSelector,
    replace,
}

module.exports = {
    state,
    getters,
    mutations,
}
