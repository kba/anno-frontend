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

module.exports = {
    state: {
        id: '',
        title: '',
        body: [],
        target: [],
        rights: '',
    },
    getters: {
        firstHtmlBody,
        simpleTagBodies,
        semanticTagBodies,
    },
    mutations: {
        add,
        ensureArray,
        setTitle(state, title) { state.title = title },
        setRights(state, v) { state.rights = v },
        addSimpleTag(state, v) {
            ensureArray(state, 'body')
            add(state, 'body', {type: 'TextualBody', motivation: 'tagging', value: ''})
        },
        addSemanticTag(state, v) {
            ensureArray(state, 'body')
            add(state, 'body', {motivation: 'linking', id: ''})
        },
        removeBody(state, v) {
            if (Array.isArray(state.body)) {
                var vIndex = state.body.indexOf(v)
                state.body.splice(vIndex, 1)
            } else if (state.body === v) {
                state.body = []
            }
        },
        setHtmlBodyContent(state, v) { 
            var body = firstHtmlBody(state)
            if (!body) {
                body = {type: 'TextualBody', format: 'text/html', value: ''}
                ensureArray(state, 'body')
                add(state, 'body', body)
            }
            body.value = v
        },
    },
}
