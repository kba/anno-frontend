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

  showVersionsDropdownForSingleVersion: true,

  purlAnnoInitiallyOpen: true,
  /* ^-- In case the app was loaded via a persistent URL of an annotation,
      whether that annotation shall be visible initially, potentially by
      opening parent threads. */
  purlId: null,
  /* ^-- In case the app was loaded via a persistent URL of an annotation,
      that annotation's ID. Should begin with the URL of `annoEndpoint`. */


  thumbFillColor:   'rgba(160,0,0,0.4)',
  thumbStrokeColor: 'rgba(160,0,0,0.9)',
  /* ^-- In case of a targetImage, thumbnails display the targeted area(s)
      using these Should be SVG colors. "Stroke" is the outline, "fill" is
      the inside of the area. */

  enableIIIF: true,
  /* ^-- Whether to show the URL of the IIIF image, a rectangular section
      that encloses all areas of an image annotation's SVG zones.
      See also: `iiifUrlTemplate` in `anno-data.js` */

  targetFragmentButtonTitle: null, /*
    Hover title (not caption) of the Fragment Identifier button.
    Usually, this should be a description of what the
    `targetFragmentButtonClicked` event handler does. (see `events.md`)
  */




  language: l10nConfig.defaultlang,
  // ^-- One of the language codes supported in the l10nConfig,
  //    e.g. `de` for German or `en` for English.

  localizations: l10nConfig.localizations,
};


module.exports = uiCfg;
