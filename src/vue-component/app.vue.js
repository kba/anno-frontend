const Vue = require('vue')

module.exports = Vue.component('annocomments', {
    props: ['anno','options','css'],
    template: require('./comments.vue.html')
})
