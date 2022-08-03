// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */


const installPopOvers = require('../../popover-helper.js').install;

module.exports = {

  template: require('./bootstrap-button.html'),
  style: [
    require('./balloon.scss'),
  ],

  props: {
    title:       String,
    prefix:      { type: String, default: 'ubhdannoprefix_zoneeditor' },
    iconText:    String,    // for using Unicode as icons
    iconFa:      String,
    src:         String,
    alt:         String,
    clickTarget: { type: Object },
    btnSize:     { type: String, default: 'sm' },
    btnClass:    { type: [String, Array], default: 'outline-secondary' },
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

    balloonBoxClasses(pre) {
      return [].concat(pre, [
        'bg-white',
        'bg-body',
        'border',
        'border-' + this.balloonColorName,
      ]).filter(Boolean);
    },

    clicked(ev) {
      const btn = this;
      btn.$emit('click', ev);
      if (btn.$slots.balloon) { btn.$el.classList.toggle('balloon-open'); }
    },

  },

};
