const AnnoStoreHttp = require('@kba/anno-store-http')

module.exports = (state) => {
    // console.log("Anno Endpoint", state.annoEndpoint)
    const annoStore = new AnnoStoreHttp({
        BASE_URL: state.annoEndpoint,
        HTTP_HEADERS: JSON.stringify({
            Authorization: `Bearer ${state.token}`,
            'X-Anno-Collection': state.collection,
            'X-Anno-Context': state.targetSource,
        }),
    })
    // console.log(annoStore)
    return annoStore
}
