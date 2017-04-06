const config = require('../config')

function l10n(lang, text) {
    lang = config.langcode[lang] ? config.langcode[lang] : config.defaultlang;
    return config.langcode[lang] && config.localizations[lang][text] !== undefined
        ? config.localizations[lang][text]
        : (config.langcode[config.defaultlang] && config.localizations[config.defaultlang][text] !== undefined)
            ? config.localizations[config.defaultlang][text]
            : text;
}
module.exports = {

    beforeMount() {
        this.l10n = (text) => l10n(this.$store.state.language, text)
    },

}
