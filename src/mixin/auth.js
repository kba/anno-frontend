module.exports = {
    methods: {
        $auth(cond, id, x) {
            const acl = this.$store.state.acl
            if (cond === 'logged-in') {
                return !! acl
            } else if (cond.match(/^(?:create|read|revise|remove)$/)) {
                // console.log("Auth check", cond, id)
                if (id === undefined) {
                    throw new Error(`Undefined id. Cannot check ${cond}`, x)
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
