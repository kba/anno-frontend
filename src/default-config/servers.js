/* -*- tab-width: 2 -*- */
'use strict';

const srvCfg = {

  // For URLs that are used only as button targets but not for automated
  //  requests, see `user-interface.js`.

  helpUrlTemplate: [
    /* Template for generating help URLs. For details, see
      `../components/help-button/help-url.js`.
    */

    'https://anno.ub.uni-heidelberg.de/anno/dist/help/digi/',
    '%hl',      // hl = <h>elp <l>anguage
    '/.well-known/',
    '%nv',      // nv = topic <n>aming scheme <v>ersion identifier
    '/help_button_topics/',
    '%ht',      // ht = <h>elp <t>opic
    '.html',
  ].join(''),

  annoEndpoint: '', // URL of the Open Annotation Protocol server.

  collection: 'default',

  tokenEndpoint: '', /*
    URL of the endpoint providing a JSON Web Token for login.
    For discussion of JWT risks, see docs/security/jwt.md.
  */

  purlTemplate: '', /*
    A string template for the persistent URL.
    `{{ slug }}` will be replaced by the slug of the annotation.
  */

};


module.exports = srvCfg;
