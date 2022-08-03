// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const tap = require('tap');
const mergeOptions = require('merge-options');

const defaultL10nConfig = require('../l10n-config.json');
const l10nMixin = require('../src/mixin/l10n.js');


function makeL10nStub(customConfig) {
  const cfg = mergeOptions(defaultL10nConfig, customConfig);
  const appStub = { $store: { state: cfg } };
  const l10n = l10nMixin.methods.l10n.bind(appStub);
  Object.assign(l10n, { cfg });
  return l10n;
}


tap.test('basic l10n', (t) => {
  t.plan(8);

  const l10n = makeL10nStub({
    localizations: {
      de: {
        kicker: 'Tischfußball',
      },
      en: {
        kicker: 'Foosball',
      },
    },
    l10nOverrides: {
      compose_new_annot: {
        de: 'Annotation verfassen',
        en: 'Compose annotation',
      },
    },
  });

  t.equals(l10n('kicker'), 'Tischfußball');
  t.equals(l10n('kikcker'), 'kikcker');
  t.equals(l10n('kikcker', 'fAllBaCk'), 'fAllBaCk');

  l10n.cfg.language = 'bogus';
  t.equals(l10n('compose_new_annot'), 'Neue Annotation');

  l10n.cfg.language = 'de';
  t.equals(l10n('kicker'), 'Tischfußball');
  t.equals(l10n('compose_new_annot'), 'Annotation verfassen');

  l10n.cfg.language = 'en';
  t.equals(l10n('kicker'), 'Foosball');
  t.equals(l10n('compose_new_annot'), 'Compose annotation');

  t.end();
});
