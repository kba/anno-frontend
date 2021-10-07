// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const bootstrapCompat = require('../bootstrap-compat.js');

const cssNamespaceClass = 'annoeditor-global-css';

function decideTopLevelCssClasses() {
  const { state } = this.$store;
  return [
    cssNamespaceClass,
    ('bs-ver-major-' + bootstrapCompat.sharedConfig.version.major),
    `ui-debug-mode-${state.uiDebugMode ? 'on' : 'off'}`,
  ];
}


module.exports = {
  IMPL: {
    cssNamespaceClass,
  },
  methods: {
    decideTopLevelCssClasses,
  },
};
