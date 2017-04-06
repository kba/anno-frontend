const tap = require('tap')
const annoApiFactory = require('../src/api/annoApi.js')

const state = {}
const annoApi = annoApiFactory({endpoint: 'http://localhost:3000/anno', token: 'my-token'})

annoApi.create({target: 'http://bla'}, (err, created) => {
    if(err) return console.log('ERROR', err)
    annoApi.search((err, annos) => {
        if(err) return console.log('ERROR', err)
        console.log('YAY', annos)
    })
})
