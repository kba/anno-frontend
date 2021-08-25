/* -*- tab-width: 2 -*- */
'use strict';

const getOwn = require('getown');
const autoDefault = require('require-mjs-autoprefer-default-export-pmb');
const loMapValues = require('lodash.mapvalues');

const annoDataApi = autoDefault(require('../annoDataApi'));



const selectorMatchers = {

  fragment(values, anno) {
    const fragId = annoDataApi.findTargetFragment(anno);
    if (!fragId) { return undefined; }
    return getOwn(values, fragId);
  },

};


async function doHighlightByTargetSelector(vuexApi, param) {
  const { annoApp } = this;
  const { eventBus } = annoApp;
  const { selector, values, others } = param;
  const matcher = getOwn(selectorMatchers, selector);
  if (!matcher) { throw new Error('Unsupported selector type: ' + selector); }
  const annos = [].concat(vuexApi.state.annotationList.list);
  // console.debug('hlBySel:', selector, matcher, values, others, annos);
  const matchedAnnoIds = {
    yes:    new Set(),  // highlighted by explicit match
    no:     new Set(),  // un-highlighted by explicit non-match
    other:  new Set(),  // matcher couldn't decide
  };
  annos.forEach(function check(anno) {
    const aid = anno.id;
    if (!aid) { return; }
    let m = matcher(values, anno);
    if (m === undefined) {
      m = others;
      matchedAnnoIds.other.add(aid);
    } else {
      matchedAnnoIds[m ? 'yes' : 'no'].add(aid);
    }
    if (typeof m !== 'boolean') { return; }
    const ev = (m ? 'startHighlighting' : 'stopHighlighting');
    eventBus.$emit(ev, aid);
  });
  const report = {
    matchedAnnoIds: loMapValues(matchedAnnoIds,
      ids => (ids.size ? Array.from(ids.values()).sort() : false)),
  };
  return report;
}


module.exports = {
  doHighlightByTargetSelector,
};
