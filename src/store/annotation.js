function isHtmlBody(body) { return body.type && body.type === 'TextualBody' && body.format === 'text/html' }

function firstHtmlBody(state) {
  if (Array.isArray(state.body))
    return state.body.find(isHtmlBody)
  else if (isHtmlBody(state.body))
    return state.body
}
function ensureArray(state, k) {
    if (!Array.isArray(state[k]))
        state[k] = state[k] === undefined ? [] : [state[k]]
}
function add(state, k, newBody) {
    state[k].push(newBody)
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
        firstHtmlBody
    },
    mutations: {
        add,
        setTitle(state, title) { state.title = title },
        setRights(state, v) { state.rights = v },
        setHtmlBodyContent(state, v) { 
            var body = firstHtmlBody(state)
            if (!body) {
                body = {type: 'TextualBody', format: 'text/html', value: ''}
                ensureArray(state, 'body')
                add(state, 'body', body)
            }
            body.value = v
        },
        ensureArray,
    },
}
