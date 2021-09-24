// -*- coding: utf-8, tab-width: 2 -*-
'use strict';
/* eslint-disable global-require */

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
    btnClass:    { type: String, default: 'outline-secondary' },
    elem:        { type: String },
    balloonColorName: { type: String, default: 'secondary' },
  },

  methods: {

    decideButtonTag() {
      const btn = this;
      const { elem } = btn.$props;
      if (elem) { return elem; }
      if (btn.$slots.balloon) { return 'div'; }
      return 'button';
    },

    decideBalloonBoxClasses(pre) {
      return [].concat(pre, [
        'bg-white',
        'bg-body',
        'border',
        'border-' + this.balloonColorName,
      ]).filter(Boolean);
    },

    clicked(ev) {
      const btn = this;
      console.debug('clicked! ehlo', { ev });
      btn.$emit('click', ev);
      console.debug('clicked! emit:', { ev });
      if (btn.$slots.balloon) { btn.$el.classList.toggle('balloon-open'); }
    },

  },

};
