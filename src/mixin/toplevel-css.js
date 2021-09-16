// -*- coding: utf-8, tab-width: 2 -*-

const bootstrapCompat = require('../bootstrap-compat.js');


function decideTopLevelCssClasses() {
  const { state } = this.$store;
  return [
    'annoeditor-global-css',
    ('bs-ver-major-' + bootstrapCompat.sharedConfig.version.major),
    `ui-debug-mode-${state.uiDebugMode ? 'on' : 'off'}`,
  ];
}


module.exports = {
  methods: {
    decideTopLevelCssClasses,
  },
};
