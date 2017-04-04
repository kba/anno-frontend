const axios = require('axios')
const querystring = require('querystring')

module.exports = class AnnoClient {

    static get instance() {
        var env
        try { env = window } catch (e) { env = process.env }
        return new AnnoClient(env.UBHDANNO_ENDPOINT, env.UBHDANNO_TOKEN)
    }

    constructor(endpoint, writeToken) {
        this.endpoint = endpoint
        this._client = axios.create({
            baseURL: endpoint || 'http://anno.ub.uni-heidelberg.de/cgi-bin/anno.cgi',
            headers: {
                Authorization: `Bearer ${writeToken}`
            }
        })
    }

    _qs(param={}) {
        var ret = this.endpoint
        if (Object.keys(param).length > 0) {
            ret += '?' + querystring.stringify(param)
        }
        return ret
    }

    get(url) {
        return this._client.get(url);
    }

    getAllRevsOfAnno(id) {
        return this._client.get(this._qs({ id }))
    }

    getOneRevOfAnno(id, rev) {
        return this._client.get(this._qs({ id, rev }))
    }

    listAnnoForURL(url) {
        return this._client.get(this._qs({'target.url': url}))
    }

    create(anno) {
        anno = JSON.parse(JSON.stringify(anno))
        delete anno.creator
        delete anno.modified
        delete anno.title
        delete anno.hasReply
        delete anno.hasVersion
        return this._client.post(this._qs(), anno)
    }

    revise(anno) {
        anno = JSON.parse(JSON.stringify(anno))
        delete anno.creator
        delete anno.created
        delete anno.modified
        delete anno.hasVersion
        return this._client.put(this._qs({id: anno.id}), anno)
    }

    createOrRevise(anno) {
        anno = JSON.parse(JSON.stringify(anno))
        delete anno.creator
        delete anno.modified
        delete anno.title
        delete anno.hasReply
        delete anno.hasVersion
        return this[anno.id ? 'revise' : 'create'](anno)
    }

    replaceRevForAnno(anno) {
        throw new Error("Not implemented")
    }


}
