const AnnoStoreHttp = require('@kba/anno-store-http')
const httpHeadersMiddleware = require('@kba/anno-mw-httpheaders')

module.exports = (state) => {
    const annoStore = new AnnoStoreHttp({
        STORE: '@kba/anno-store-http',
        BASE_URL: state.annoEndpoint,
        HTTPHEADERS: `Authorization: Bearer ${state.token}`,
    })
    console.log(annoStore)
    annoStore.use(httpHeadersMiddleware())
    return annoStore
}
