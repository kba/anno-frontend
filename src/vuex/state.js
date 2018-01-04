const {defaultLang} = require('../../l10n-config.json')

module.exports = {
  language: defaultLang,
  annoEndpoint: 'https://anno.ub.uni-heidelberg.de/anno/anno',
  tokenEndpoint: null,
  loginEndpoint: 'https://anno.ub.uni-heidelberg.de/anno/auth/login',
  registerEndpoint: 'https://anno.ub.uni-heidelberg.de/anno/auth/register',
  requestEndpoint: 'https://anno.ub.uni-heidelberg.de/anno/auth/request',
  logoutEndpoint: null,
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

  editMode: null,

  enableRequestButton: true,
  enableRegisterButton: true,
  enableLogoutButton: true,
  enableIIIF: true,

  cacheBusterEnabled: false,
}
