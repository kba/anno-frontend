/* -*- tab-width: 2 -*- */
'use strict';

const language = require('../l10n-config.json').defaultlang;

const helpUrlTemplate = [
  // Explanations here are informational; authoritative documentation
  // is in src/components/help-button/help-button.js.

  'https://anno.ub.uni-heidelberg.de/anno/dist/help/digi/',
  '%hl',      // hl = <h>elp <l>anguage
  '/.well-known/',
  '%nv',      // nv = topic <n>aming scheme <v>ersion identifier
  '/help_button_topics/',
  '%ht',      // ht = <h>elp <t>opic
  '.html',
].join('');

function decide() {
  const cfg = {
    // For bootstrap default config see ./bootstrap-compat.js.
    container: '…container',
    helpUrlTemplate,
    language,
    prefix: 'anno-app-',
    targetSource: window.location.href,
    offerCreateNewAnnotationButton: true,
    targetImage: null,
    targetFragment: null,
  };
  return cfg;
};



module.exports = decide;
