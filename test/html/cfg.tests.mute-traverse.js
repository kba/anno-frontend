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

  function chkIsGlobal(val, key) { return ((val === window[key]) && key); }

  function customTraverse(val, seen, pathKeys, parentPathVals, tooDeep) {
    // console.debug('customTraverse', pathKeys);
    if (parentPathVals.includes(val)) { return; }
    var tmp = (chkIsGlobal(val, 'window')
      || chkIsGlobal(val, 'document'));
    if (tmp) {
      tmp = {
        blockedGlobal: tmp,
        pathKeys: pathKeys,
        parentPathVals: parentPathVals,
      };
      window.vueAbortedDive = tmp;
      return console.warn('Vue _traverse(): Aborted dive into global:', tmp);
    }
    if (val === document) {
      throw new Error('Vue _traverse(): Aborted dive into document');
    }
    function pkj(n) { return pathKeys.slice(-n).join(' '); }
    if (pkj(4) === 'thumb vsm_ listenerKey_ src') {
      return tooDeep.abortSilently;
    }
    if (pkj(3) === 'vm $store _vm') { return tooDeep.abortSilently(); }
    if (pathKeys.length >= skipRecurs.cmpLength) {
      if (skipRecurs.includes(pkj(skipRecurs.cmpLength))) { return; }
    }
    origTrav(val, seen, pathKeys, parentPathVals, tooDeep);
  }





  dbg = {
    maxDepth: 128,
    initCustomTraverse: function init(trav) {
      origTrav = trav.dive;
      trav.dive = customTraverse;
    },
    customTraverse: customTraverse,
  };

  window.vueDebugTraverse = dbg;
  console.debug('vueDebugTraverse', dbg);
}());
