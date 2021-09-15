/* -*- tab-width: 2 -*- */
'use strict';
/* eslint-disable global-require */

const helpTopicsNamingSchemeVersion = '210701';

module.exports = {

  mixins: [
    /* eslint-disable global-require */
    require('../../mixin/l10n'),
  ],

  template: require('./help-button.html'),
  style: require('./help-button.scss'),

  props: {
    topic:        { type: String, required: true },
    title:        { type: String, default: '' },
    buttonLabel:  { type: String, default: '' },
    bootstrapBtnCls:  { type: [String, null], default: 'outline-secondary' },
  },

  computed: {

    helpUrl() {
      const { state } = this.$store;
      let url = String(state.helpUrlTemplate
        || this.l10n('help.url.template')
        || 'about:blank');
      url = url.replace(/%hl/g, encodeURIComponent(state.language));
      url = url.replace(/%nv/g, helpTopicsNamingSchemeVersion);
      url = url.replace(/%ht/g, encodeURIComponent(this.topic));
      return url;
    },

  },

};
