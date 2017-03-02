var config = require('./config')

module.exports = function l10n(lang, text) {
    lang = config.langcode[lang] ? config.langcode[lang] : config.defaultlang;
    return config.langcode[lang] && config.localizations[lang][text] !== undefined
        ? config.localizations[lang][text]
        : (config.langcode[config.defaultlang] && config.localizations[config.defaultlang][text] !== undefined)
            ? config.localizations[config.defaultlang][text]
            : text;
}
