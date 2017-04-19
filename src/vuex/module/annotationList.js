
const sorters = {
    date(a, b) {
        a = a.modified || 0
        b = b.modified || 0
        return !(a||b) ? 0 : !a ? -1 : !b ? +1 : a < b ? +1 : a > b ? -1 : 0
    },
    datereverse(a, b) {
        a = a.modified || 0
        b = b.modified || 0
        return -1 * (!(a||b) ? 0 : !a ? -1 : !b ? +1 : a < b ? +1 : a > b ? -1 : 0)
    },
    title(a, b)       {
        a = a.title ? a.title.toLowerCase() : ''
        b = b.title ? b.title.toLowerCase() : ''
        return !a ? +1 : !b ? -1 : a < b ? -1 : a > b ? + 1 : 0
    },
}

module.exports = {
    state: {
        list: [],
        sortedBy: 'title',
        allCollaped: 'false',
    },
    getters: {
        numberOfAnnotations(state) {
            console.log(state)
            return state.list.length
        },
    },
    actions: {

        sort({commit, state}, sortBy) {
            commit('SORT_LIST', sortBy)
        },

        // TODO
        // resetAnnotationToVersion({commit, state}, {annotation, newState}) {
        //     commit('REPLACE_ANNOTATION', {annotation, newState})
        // }

    },
    mutations: {

        SORT_LIST(state, sortBy) {
            if (!sortBy) sortBy = state.sortedBy
            state.list.sort(sorters[sortBy])
            state.sortedBy = sortBy
        },

        // TODO
        // REPLACE_ANNOTATION_IN_LIST(state, {annotation, newState}) {
        //     const idx = state.list.indexOf(annotation)
        //     Object.keys(state.list[idx]).forEach(k => {
        //         if (k === 'hasReply' || k === 'hasVersion') return
        //         else if (k in newState) state.list[idx][k] = newState[k]
        //         else state.list[idx][k] = null
        //     })
        // },

        REPLACE_LIST(state, list) {
            state.list = list
        },

        ADD_TO_LIST(state, v) {
            state.list.push(v)
        },
    }
}
