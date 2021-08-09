/* -*- tab-width: 2 -*- */
'use strict';

const getOwn = require('getown');
const autoDefault = require('require-mjs-autoprefer-default-export-pmb');

const annoDataApi = autoDefault(require('../annoDataApi'));
const eventBus = require('../event-bus');



const selectorMatchers = {

  fragment(values, anno) {
    const fragId = annoDataApi.findTargetFragment(anno);
    if (!fragId) { return undefined; }
    return getOwn(values, fragId);
  },

};


async function doHighlightByTargetSelector(vuexApi, param) {
  const { annoApp } = this;
  const { selector, values, others } = param;
  const matcher = getOwn(selectorMatchers, selector);
  if (!matcher) { throw new Error('Unsupported selector type: ' + selector); }
  const annos = [].concat(vuexApi.state.annotationList.list);
  // console.debug('hlBySel:', selector, matcher, values, others, annos);
  annos.forEach(function check(anno) {
    const aid = anno.id;
    if (!aid) { return; }
    let m = matcher(values, anno);
    if (m === undefined) { m = others; }
    if (typeof m !== 'boolean') { return; }
    const ev = (m ? 'startHighlighting' : 'stopHighlighting');
    eventBus.$emit(ev, aid);
  });
}


module.exports = {
  doHighlightByTargetSelector,
};
