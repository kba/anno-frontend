const axios = require('axios')
const querystring = require('querystring')
const AnnoStoreHttp = require('@kba/anno-store-http')
const httpHeadersMiddleware = require('@kba/anno-mw-httpheaders')

module.exports = (...args) => new AnnoApi(...args)

class AnnoApi {

    constructor(config) {
        this.annoStore = new AnnoStoreHttp({
            STORE: '@kba/anno-store-http',
            BASE_URL: config.endpoint,
            HTTP_HEADERS: `Authorization: Bearer ${config.token}`,
        })
        this.annoStore.use(httpHeadersMiddleware())
    }

    aclCheck(uris, cb) {
        this.annoStore.aclCheck(uris, cb)
    }

    search(query, cb) {
        if (typeof query === 'function') [cb,query] = [query,{}]
        if (query['target.source']) {
            query['$target'] = query['target.source']
            delete query['target.source']
        }
        // XXX HACK HACK  this will return al results for debugging
        this.annoStore.search({}, cb)
        // this.annoStore.search(query, {}, cb)
    }

    create(anno, cb) {
        anno = JSON.parse(JSON.stringify(anno))
        delete anno.hasVersion
        delete anno.versionOf
        delete anno.hasReply
        delete anno.replyTo
        return this.annoStore.create(anno, cb)
    }
    comment(id, anno, cb) {
        return this.annoStore.reply(id, anno, cb) 
    }
    revise(id, anno, cb)  {
        anno = JSON.parse(JSON.stringify(anno))
        delete anno.hasVersion
        delete anno.versionOf
        delete anno.hasReply
        delete anno.via
        delete anno.replyTo
        return this.annoStore.revise(id, anno, cb) 
    }
    remove(id, cb) {
        return this.annoStore.delete(id, cb)
    }

}
