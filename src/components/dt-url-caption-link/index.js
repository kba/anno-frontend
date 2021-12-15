// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const fragment = require('vue-frag').Fragment;

module.exports = {
  components: {
    fragment,
  },
  template: require('./dt.html'),
  props: {
    url:        { type: String },
    caption:    { type: String },
  },
};
