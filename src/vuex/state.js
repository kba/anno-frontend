const {defaultLang, localizations} = require('../../l10n-config.json')

module.exports = {
  annoEndpoint: null,
  tokenEndpoint: null,
  loginEndpoint: null,
  registerEndpoint: null,
  logoutEndpoint: null,
  permissionsRequestFormUrl: null,
  permissionsRequestAllowGuest: false,
  purlTemplate: null,
  purlId: null,
  purlAnnoInitiallyOpen: true,
  targetSource: window.location.href,
  targetImage: null,
  targetImageWidth: -1,
  targetImageHeight: -1,
  thumbStrokeColor: '#900',
  thumbFillColor: '#900',
  iiifUrlTemplate: null,
  targetThumbnail: null,
  collection: null,
  token: null,
  acl: null,
  targetFragmentButtonTitle: null,

  editMode: null,

  enableRequestButton: true,
  enableRegisterButton: true,
  enableLogoutButton: true,
  enableIIIF: true,

  cacheBusterEnabled: false,

  language: defaultLang,
  localizations,

  uiDebugMode: false,
}
