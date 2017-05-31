/**
 * ### `this.$auth(cond, [id])`
 *
 * Check authorization of user against `$store.state.acl`
 *
 * - `$auth(<cond>, <url>)` should be read as "Is the current user
 *   authorized to apply action `<cond>` on `<url>`"
 *
 */
module.exports = {
    methods: {
        $auth(cond, id) {
            const acl = this.$store.state.acl
            if (cond.match(/^(?:create|read|revise|remove)$/)) {
                if (id === undefined) {
                    throw new Error(`Undefined id. Cannot check ${cond}`)
                }
                if (!acl) {
                    // console.warn("Not logged in")
                    return false
                }
                if (!(id in acl)) {
                    // console.warn(`No auth information for ${id}, denying.`)
                    return false
                }
                return acl[id][cond]
            }
            else throw new Error(`No such ACL condition '${cond}'`)
        }
    }
}
