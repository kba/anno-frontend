const {langcode, defaultlang, localizations} = require('../config')

function l10n(lang, text) {
    lang = langcode[lang] ? langcode[lang] : defaultlang;
    return langcode[lang] && localizations[lang][text] !== undefined
        ? localizations[lang][text]
        : (langcode[defaultlang] && localizations[defaultlang][text] !== undefined)
            ? localizations[defaultlang][text]
            : text;
}

module.exports = {

    methods: {
        l10n(text) { return l10n(this.$store.state.language, text) }
    },

}
