// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');

function notImpl() { throw new Error('not implemented'); }

const EX = function bindDataApi(viewer) {
  return function dataApi(mthd, ...args) {
    try {
      return getOwn(EX.impl, mthd, notImpl)(viewer, ...args);
    } catch (err) {
      err.message += (' in data API call "' + mthd
        + '" for Anno ID "' + viewer.id + '"');
      throw err;
    }
  };
};

const impl = {

  findTargetSelectors(viewer, opt) {
    const tgt = viewer.annotation.target;
    let sel = (tgt || false).selector;
    if (!sel) { return []; }
    sel = [].concat(sel).filter(Boolean);
    if (!opt) { return sel; }
    if (opt.type) { sel = sel.filter(s => (s.type === opt.type)); }
    if (opt.map) { sel = sel.filter(opt.map); }
    if (opt.filter) { sel = sel.filter(opt.filter); }
    if (opt.unique) {
      if (sel.length <= 1) { return (sel[0] || false); }
      throw new Error('Selector not unique');
    }
    return sel;
  },

  findTargetFragment(viewer) {
    return (impl.findTargetSelectors(viewer, {
      type: 'FragmentSelector',
      unique: true,
    }).value || null);
  },

};


Object.assign(EX, {
  impl,
});

module.exports = EX;
