/* -*- tab-width: 2 -*- */
'use strict';

const mergeOptions = require('merge-options');

const cfg = { // Default config. will be updated in-place later.
  version: { major: 4 },
};

const defaultTagsByBsMajorVer = {
  '3': {
    dropdownMenu: 'ul',
    dropdownMenuItem: 'li',

    modalHeaderTitle: 'h4',

    snowflakes: {
      annoListSortMenu: { clsAll: 'btn btn-sm', clsChosen: 'btn-primary' },
    },
  },
  '4': {
    dropdownMenu: 'div',
    dropdownMenuItem: 'a',
    // ul+li seems to work for BS4 as well and would be more semantic,
    // but I couldn't find official compatibility info in the BS4 docs.

    modalHeaderTitle: 'h5',

    snowflakes: {
      annoListSortMenu: { clsAll: 'dropdown-item', clsChosen: 'active' },
    },
  },
};

function thr0w(e) { throw e; }

function initialize(customOpt) {
  Object.assign(cfg, mergeOptions.call({ ignoreUndefined: true },
    cfg, customOpt));
  const dfTags = (defaultTagsByBsMajorVer[cfg.version.major]
    || thr0w(new Error('Unsupported bootstrap version!')));
  cfg.tags = mergeOptions(dfTags, cfg.tags);
  Object.freeze(cfg);
}




module.exports = {
  sharedConfig: cfg,
  initialize,
};
