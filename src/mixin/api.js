const apiFactory = require('../api')

module.exports = {
    computed: {
        api() { return apiFactory(this.$store.state) }
    }
}
