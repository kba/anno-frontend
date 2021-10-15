/* -*- tab-width: 2 -*- */
'use strict';

const srvCfg = {

  // For URLs that are used only as button targets but not for automated
  //  requests, see `user-interface.js`.

  helpUrlTemplate: [
    // Explanations here are informational; authoritative documentation
    // is in src/components/help-button/help-url.js.

    'https://anno.ub.uni-heidelberg.de/anno/dist/help/digi/',
    '%hl',      // hl = <h>elp <l>anguage
    '/.well-known/',
    '%nv',      // nv = topic <n>aming scheme <v>ersion identifier
    '/help_button_topics/',
    '%ht',      // ht = <h>elp <t>opic
    '.html',
  ].join(''),

  annoEndpoint: null,
  tokenEndpoint: null,

};


module.exports = srvCfg;
