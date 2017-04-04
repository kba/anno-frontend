const Vue = require('vue')

module.exports = Vue.component('anno-comments', {
    props: ['anno','options','css'],
    template: require('./comments.html')
})

