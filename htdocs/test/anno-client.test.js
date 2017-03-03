var tap = require('tap')
const config = require('../src/config')
const AnnoClient = require('../src/anno-client')

// {service: 'diglit'}
// const writeToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzZXJ2aWNlIjoiZGlnbGl0Iiwid3JpdGUiOjEsInVzZXIiOiJydDEyNkB1bmktaGVpZGVsYmVyZy5kZSJ9.S8pP4a_NdUa3wJoJhloXpzZaHyIIjEEqqCzxVowdoco'
// {service: 'kba-test-service', ...}
const writeToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicnQxMjZAdW5pLWhlaWRlbGJlcmcuZGUiLCJzZXJ2aWNlIjoia2JhLXRlc3Qtc2VydmljZSIsIndyaXRlIjoxfQ.Yg3g8x3EQ7zsGKPLHC4weMltGJ5yRUMm2VI5zEBzQLQ'
const readToken = writeToken

const c = new AnnoClient(config.annoserviceurl, readToken, writeToken);

tap.test('post new anno', t => {
    const target = 'http://open.sesame/bar'
    const body = {
        'dc:title': 'Foo',
    }
    c.createAnno({target, body})
        .then(response => {
            t.equals(response.status, 200, 'HTTP 200')
            console.log('OK', response)
            t.end();
        })
        .catch(({response}) => console.log('Error', response.status, response.data))
});

tap.test('list for url', t => {
    c.listAnnoForURL('http://blablabla')
        .then(response => {
            t.equals(response.status, 200, 'HTTP 200')
            t.equals(response.data.length, 1, 'one annotation')
            t.end()
        });
});
