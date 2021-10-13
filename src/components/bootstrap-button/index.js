// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */


const installPopOvers = require('../../popover-helper.js').install;

module.exports = {

  template: require('./bootstrap-button.html'),

  props: {
    title:       String,
    prefix:      { type: String, default: 'ubhdannoprefix_zoneeditor' },
    iconText:    String,    // for using Unicode as icons
    iconFa:      String,
    src:         String,
    alt:         String,
    clickTarget: { type: Object },
    btnSize:     { type: String, default: 'sm' },
    btnClass:    { type: String, default: 'outline-secondary' },
    elem:        { type: String },
    balloonColorName: { type: String, default: 'secondary' },
    popoverContentOpts: { type: [Object, false, null, undefined] },
  },

  mounted() {
    const btn = this;
    if (btn.$slots.popover) {
      installPopOvers(btn.$el, {
        subSel: null,
        content: btn.$refs.popoverContent,
        ...btn.popoverContentOpts,
      });
    }
  },

  methods: {

    decideButtonTag() {
      const btn = this;
      const { elem } = btn.$props;
      if (elem) { return elem; }
      if (btn.$slots.balloon) { return 'div'; }
      if (btn.$slots.popover) { return 'div'; }
      return 'button';
    },

    clicked(ev) {
      const btn = this;
      btn.$emit('click', ev);
    },

  },

};
