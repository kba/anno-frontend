const config = require('../config')

module.exports = {

    beforeMount() {
        this.l10n = config.localizations[this.$store.state.language]
    },

}
