const AnnoStoreHttp = require('@kba/anno-store-http')
const httpHeadersMiddleware = require('@kba/anno-mw-httpheaders')

module.exports = (state) => {
    const annoStore = new AnnoStoreHttp({
        STORE: '@kba/anno-store-http',
        BASE_URL: state.annoEndpoint,
        // TODO get token from state
        HTTP_HEADERS: `Authorization: Bearer ${state.token}`,
    })
    annoStore.use(httpHeadersMiddleware())
    return annoStore
}
