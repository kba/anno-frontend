const AnnoStoreHttp = require('@kba/anno-store-http')

module.exports = (state) => {
    // console.log("Anno Endpoint", state.annoEndpoint)
    const HTTP_HEADERS = {}
    if (state.token)
        HTTP_HEADERS['Authorization'] = `Bearer ${state.token}`
    if (state.collection)
        HTTP_HEADERS['X-Anno-Collection'] = state.collection
    if (state.targetSource)
        HTTP_HEADERS['X-Anno-Context'] = state.targetSource
    if (state.metadataToken)
        HTTP_HEADERS['X-Anno-Metadata'] = state.metadataToken
    const annoStore = new AnnoStoreHttp({
        BASE_URL: state.annoEndpoint,
        HTTP_HEADERS: JSON.stringify(HTTP_HEADERS)
    })
    // console.log(annoStore)
    return annoStore
}
