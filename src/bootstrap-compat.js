/* -*- tab-width: 2 -*- */
'use strict';

const mergeOptions = require('merge-options');

const cfg = {
  version: { major: 4 },
};

const defaultTagsByBsMajorVer = {
  '3': {
    dropdownMenu: 'ul',
    dropdownMenuItem: 'li',
  },
  '4': {
    dropdownMenu: 'div',
    dropdownMenuItem: 'a',
    // ul+li seems to work for BS4 as well and would be more semantic,
    // but I couldn't find official compatibility info in the BS4 docs.
  },
};

function thr0w(e) { throw e; }

function initialize(customOpt) {
  mergeOptions.call(cfg, customOpt);
  const dfTags = (defaultTagsByBsMajorVer[cfg.version.major]
    || thr0w(new Error('Unsupported bootstrap version!')));
  cfg.tags = mergeOptions(dfTags, cfg.tags);
}




module.exports = {
  sharedConfig: cfg,
  initialize,
};
