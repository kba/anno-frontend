/**
 * ### `this.prefix`
 *
 * Sets `this.prefix` to the prefix defined globally.
 */
module.exports = {
    computed: {
        prefix() {return this.$store.state.prefix}
    }
}
