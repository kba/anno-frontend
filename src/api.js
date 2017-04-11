const AnnoStoreHttp = require('@kba/anno-store-http')
const httpHeadersMiddleware = require('@kba/anno-mw-httpheaders')

module.exports = (config) => {
    const annoStore = new AnnoStoreHttp({
        STORE: '@kba/anno-store-http',
        BASE_URL: config.endpoint,
        // TODO get token from state
        HTTP_HEADERS: `Authorization: Bearer ${config.token}`,
    })
    annoStore.use(httpHeadersMiddleware())
    return annoStore
}
