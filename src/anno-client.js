const axios = require('axios')
const querystring = require('querystring')

module.exports = class AnnoClient {

    constructor(endpoint, writeToken) {
        this.endpoint = endpoint
        this._client = axios.create({
            baseURL: endpoint,
            headers: {
                authorization: `Bearer ${writeToken}`
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

    createAnno(anno) {
        return this._client.post(this._qs(), anno)
    }

    reviseAnno(id, anno) {
        return this._client.put(this._qs({id}), anno)
    }

    replaceRevForAnno(anno) {
        throw new Error("Not implemented")
    }


}
