// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');

const xrxStyleProps = {
  thumbStrokeColor:   { type: [String, undefined] },
  thumbFillColor:     { type: [String, undefined] },
};


module.exports = {
  /* eslint-disable global-require */
  template: require('./thumb.html'),
  /* eslint-enable global-require */

  props: {
    svgTarget:    { type: [Object] },
    sizePx:       { type: [Number], default: 36 },
    widthPx:      { type: [Number, undefined] },
    heightPx:     { type: [Number, undefined] },

    ...xrxStyleProps,

  },

  computed: {

    xrxStyle() {
      const thumb = this;
      const appCfg = thumb.$store.state;
      const st = {};
      Object.keys(xrxStyleProps).forEach(function add(propName) {
        const xrxOptName = propName.replace(/^thumb(\w)/,
          function fmt(m, l) { return (m && l.toLowerCase()); });
        st[xrxOptName] = getOwn(thumb, propName, appCfg[propName]);
      });
      return st;
    },

  },
};
