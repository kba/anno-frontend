var tap = require('tap')

tap.test('basic l10n', (t) => {
    var config = require('../src/config');
    var l10n = require('../src/l10n')

    config.localizations['de']['kicker'] = 'Tischfussball'
    config.localizations['en']['kicker'] = 'Foosball'

    t.equals(l10n('en', 'kicker'), 'Foosball', 'correctly translated -> en');
    t.equals(l10n('de', 'kicker'), 'Tischfussball', 'correctly translated -> de');
    t.end();
});
