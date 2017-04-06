const annoApiFactory = require('../api/annoApi.js')

module.exports = {
    computed: {
        api() { return annoApiFactory(this.$store.state) }
    }
}
