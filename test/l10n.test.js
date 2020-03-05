var tap = require('tap')

tap.test('basic l10n', (t) => {
    var config = require('../l10n-config.json');
    var l10n = require('../src/mixin/l10n.js')._l10n

    config.localizations['de']['kicker'] = 'Tischfussball'
    config.localizations['en']['kicker'] = 'Foosball'

    t.equals(l10n('en', 'kicker', config.localizations), 'Foosball', 'correctly translated -> en');
    t.equals(l10n('de', 'kicker', config.localizations), 'Tischfussball', 'correctly translated -> de');
    t.end();
});
