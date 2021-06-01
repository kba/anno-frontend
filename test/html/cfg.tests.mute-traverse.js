/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function configure() {
  'use strict';
  var origTrav, dbg, skipRecurs = [];
  skipRecurs.cmpLength = 12;
  function addRecurs(pattern) {
    function p(x, i) { return pattern[i % (pattern || x).length]; }
    skipRecurs.push(Array.from({ length: skipRecurs.cmpLength }, p).join(' '));
  }

  addRecurs(['canvas_', 'childs_', 1]);

  function customTraverse(val, seen, pathKeys, parentPathVals, tooDeep) {
    var recurs;
    if (parentPathVals.includes(val)) { return; }
    if (pathKeys.length >= skipRecurs.cmpLength) {
      recurs = pathKeys.slice(-skipRecurs.cmpLength).join(' ');
      if (skipRecurs.includes(recurs)) { return; }
    }
    return origTrav(val, seen, pathKeys, parentPathVals, tooDeep);
  }





  dbg = {
    maxDepth: 32,
    initCustomTraverse: function init(trav) {
      origTrav = trav.dive;
      trav.dive = customTraverse;
    },
    customTraverse: customTraverse,
  };

  window.vueDebugTraverse = dbg;
  console.debug('vueDebugTraverse', dbg);
}());
