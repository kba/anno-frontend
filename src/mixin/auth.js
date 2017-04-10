module.exports = {
    /**
     * ### `$auth(cond, [id]`
     *
     * Check authorization of user against `$store.state.acl`
     *
     * - `$auth(<cond>, <url>)` should be read as "Is the current user
     *   authorized to apply action `<cond>` on `<url>`"
     *
     */
    methods: {
        $auth(cond, id) {
            const acl = this.$store.state.acl
            if (cond.match(/^(?:create|read|revise|remove)$/)) {
                // console.log("Auth check", cond, id)
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
