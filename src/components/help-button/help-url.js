/* -*- tab-width: 2 -*- */
/*

The help URLs are rendered based on the `helpUrlTemplate` setting,
by replacing some special slots in the template URL with data such
as help topic and application language.

See the `replace`menets below for which slots are supported.

*/
'use strict';

const helpTopicsNamingSchemeVersion = '210701';

function helpUrl() {
  const { state } = this.$store;
  let url = String(state.helpUrlTemplate
    || this.l10n('help.url.template')
    || 'about:blank');
  url = url.replace(/%hl/g, encodeURIComponent(state.language));
  url = url.replace(/%nv/g, helpTopicsNamingSchemeVersion);
  url = url.replace(/%ht/g, encodeURIComponent(this.topic));
  return url;
}


module.exports = helpUrl;
