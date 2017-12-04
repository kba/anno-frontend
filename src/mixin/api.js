const apiFactory = require('../api')

/**
 * ### `this.api`
 *
 * Adds `this.api`, a new anno-http-store configured to communicate with `annoEndpoint`
 *
 * ```js
 * this.api.revise('http://anno1', {...}, (err) => console.error(err))
 * ```
 *
 */

module.exports = {
    computed: {
        api() {return apiFactory(this.$store.state)}
    }
}
