const {langcode, defaultlang, localizations} = require('../config')

function l10n(lang, text) {
    lang = langcode[lang] ? langcode[lang] : defaultlang;
    return localizations[lang][text] !== undefined
        ? localizations[lang][text]
        : localizations[defaultlang][text] !== undefined
            ? localizations[defaultlang][text]
            : text;
}

module.exports = {

    methods: {
        l10n(text) { return l10n(this.$store.state.language, text) }
    },

}
