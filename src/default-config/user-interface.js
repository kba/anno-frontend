/* -*- tab-width: 2 -*- */
'use strict';

const l10nConfig = require('../../l10n-config.json');

const uiCfg = {

  // For HTML/DOM specific stuff, see `html-dom.js`.

  uiDebugMode: false,

  loginRegistrationFormUrl: null,
  loginFormUrl: null,

  logoutPageUrl: null, /*
    URL where the logout button should lead to.
    Use the special URL "fake://insecure" to have the logout button just
    make the anno app forget its token without notifying the session server
    about the user's attempt to invalidate it.
  */

  permissionsRequestFormUrl: null,
  permissionsRequestAllowGuest: false,

  offerCreateNewAnnotationButton: true,

  purlAnnoInitiallyOpen: true,

  thumbStrokeColor: 'rgba(160,0,0,0.9)',
  thumbFillColor:   'rgba(160,0,0,0.4)',

  enableIIIF: true, // for `iiifUrlTemplate`, see `anno-data.js`

  targetFragmentButtonTitle: null,






  language: l10nConfig.defaultlang,
  localizations: l10nConfig.localizations,
};


module.exports = uiCfg;
