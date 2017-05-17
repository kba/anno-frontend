const {langcode, defaultlang, localizations} = require('../../l10n-config.json')

function l10n(lang, text) {
    lang = langcode[lang] ? langcode[lang] : defaultlang;
    return localizations[lang][text] !== undefined
        ? localizations[lang][text]
        : localizations[defaultlang][text] !== undefined
            ? localizations[defaultlang][text]
            : text;
}

/**
 * ### `this.l10n(text)`
 *
 * Localization mixin. Will return the localized string in the currently
 * enabled `language`.
 *
 * Translations are kept in [`../../l10n-config.json`](./tree/master/l10n-config.json) in an object
 *
 * ```
 * config.localizations = {
 *   de: {
 *     login: 'Anmelden',
 *   },
 *   en: {
 *     login: 'Log in',
 *   },
 * }
 * ```
 *
 * If no translation for the enabled language is available, fall back to the
 * `defaultLang`.
 *
 * If there is no translation in the `defaultLang` (which is a bug) just return
 * the string.
 *
 *
 */

module.exports = {

    methods: {
        l10n(text) { return l10n(this.$store.state.language, text) }
    },
    _l10n: l10n,
}
