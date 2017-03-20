var tap = require('tap')
const config = require('../src/config')
const AnnoClient = require('../src/anno-client')

config.annoserviceurl = process.env.UBHDANNO_BASEURL || 'http://anno.ub.uni-heidelberg.de/cgi-bin/anno.cgi'

// {service: 'diglit'}
// const writeToken = [
//     'eyJhbGciOiJIUzI1NiJ9',
//     'eyJzZXJ2aWNlIjoiZGlnbGl0Iiwid3JpdGUiOjEsInVzZXIiOiJydDEyNkB1bmktaGVpZGVsYmVyZy5kZSJ9',
//     'S8pP4a_NdUa3wJoJhloXpzZaHyIIjEEqqCzxVowdoco'].join('.')

// {service: 'kba-test-service', ...}
const writeToken = [
    'eyJhbGciOiJIUzI1NiJ9',
    'eyJ1c2VyIjoicnQxMjZAdW5pLWhlaWRlbGJlcmcuZGUiLCJzZXJ2aWNlIjoia2JhLXRlc3Qtc2VydmljZSIsIndyaXRlIjoxfQ',
    'Yg3g8x3EQ7zsGKPLHC4weMltGJ5yRUMm2VI5zEBzQLQ'].join('.')

const c = new AnnoClient(config.annoserviceurl, writeToken);

const target1 = 'http://open.sesame/bar';
const target2 = 'http://"?><? insert bobby tables';

tap.test('post new anno', t => {
    const target = [{ url: target1 }]
    const body = [{ 'title': 'Foo' }]
    c.createAnno({target, body}).then(response => {
        t.equals(response.status, 201, 'POST: HTTP 201 Created')
        t.comment(response.headers)
        const postedUri = response.headers.location
        t.match(postedUri, /\?id=[a-z0-9-]+&rev=\d$/, 'POST: Location: ?id=...&rev=...')
        c.get(postedUri).then(response => {
            t.equals(response.status, 200, 'GET: HTTP 200 Found')
            t.equals(response.headers['content-type'], 'application/ld+json', 'GET Content-Type: JSON-LD')
            const annoGot = response.data
            t.equals(annoGot.id, postedUri.replace(/&rev.*/, ''), "POST -> Location startswith data.id")
            // console.log(annoGot);
            t.end();
        })
        .catch(({response}) => console.log('Error', response.status, response.data))
    })
    .catch(({response}) => console.log('Error', response.status, response.data))
});

tap.test('list for url', t => {
    c.listAnnoForURL(target1)
        .then(response => {
            t.equals(response.status, 200, 'HTTP 200')
            t.equals(response.data.length, 1, 'one annotation')
            t.end()
        });
});
