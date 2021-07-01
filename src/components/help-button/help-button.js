/* -*- tab-width: 2 -*- */
'use strict';

const helpTopicsNamingSchemeVersion = '210701';

module.exports = {

  template: require('./help-button.html'),
  style: require('./help-button.scss'),

  props: {
    topic:        { type: String, required: true },
    triggerCls:   { type: String, default: '' },
    buttonLabel:  { type: String, default: '' },
  },

  computed: {

    helpUrl() {
      const { state } = this.$store;
      let url = String(state.helpUrlTemplate || 'about:blank');
      url = url.replace(/%hl/g, encodeURIComponent(state.language));
      url = url.replace(/%nv/g, helpTopicsNamingSchemeVersion);
      url = url.replace(/%ht/g, encodeURIComponent(this.topic));
      return url;
    },

  },

};
