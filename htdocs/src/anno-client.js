const axios = require('axios')
const querystring = require('querystring')

module.exports = class AnnoClient {

    constructor(endpoint, readToken, writeToken) {
        this.endpoint = endpoint
        this.readToken = readToken
        this.writeToken = writeToken
        this._client = axios.create({
            baseURL: endpoint,
            headers: {
                rtok: readToken
            }
        })
    }

    _qs(param={}) {
        Object.assign(param, {rtok: this.readToken, wtok: this.writeToken})
        return `${this.endpoint}?${querystring.stringify(param)}`
    }

    getAllRevsOfAnno(id) {
        return axios.get(this._qs({ id }))
    }

    getOneRevOfAnno(id, rev) {
        return axios.get(this._qs({ id, rev }))
    }

    listAnnoForURL(url) {
        return axios.get(this._qs({'target.url': url}))
    }

    createAnno(anno) {
        return axios.post(this._qs(), anno)
    }

    reviseAnno(id, anno) {
        return axios.put(this._qs({id}), anno)
    }

    replaceRevForAnno(anno) {
        throw new Error("Not implemented")
    }


}
