// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

function unpackSingleElementArray(a) { return (a.length === 1 ? a[0] : a); }


const dat = function decideAnnoTarget(state) {
  const tgtSels = [];

  if (state.targetFragment) {
    tgtSels.push({
      type: 'FragmentSelector',
      value: state.targetFragment,
    });
  }

  if (!tgtSels.length) {
    // No selector means our target is most likely an External Web Resource
    // (ch 3.2.1) or Segment thereof (ch 3.2.3).
    // Since all of their extra data (e.g. ch 3.2.2 "Classes") is optional,
    // we can just provide the value of the "id" field directly:
    return state.targetSource;
  }

  // Using any selector(s) means our target is must be a
  // Specific Resource (ch 4):
  const tgtSpec = {
    source: state.targetSource,
    selector: unpackSingleElementArray(tgtSels),
  };
  return tgtSpec;
};


module.exports = dat;
