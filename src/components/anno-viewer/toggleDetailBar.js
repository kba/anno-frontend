// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const jq = require('jquery');


function maybeImportHtml(bar, refs) {
  const dests = jq(bar).find('[html-src-ref]');
  if (!dests[0]) { return; }
  dests.each(function importHtml(idx, dest) {
    const srcRef = dest.getAttribute('html-src-ref');
    const html = ((refs[srcRef] || false).innerHTML || '');
    dest.innerHTML = html; // eslint-disable-line no-param-reassign
  });
}


function toggleDetailBar(ev) {
  const viewer = this;
  const trigger = jq(ev.target).closest('button');
  const barName = trigger.data('detailbar');
  if (!barName) { throw new Error('No detailbar name'); }
  const detBars = viewer.$refs.detailbars;
  const openCls = 'active';
  const barElem = detBars.querySelector('.detailbar-' + barName);
  if (!barElem) { throw new Error('No such detailbar: ' + barName); }
  const wasOpen = trigger.hasClass(openCls);
  const buttonAndBar = jq([trigger[0], barElem]);
  // console.debug('toggleDetailBar', barName, wasOpen, buttonAndBar);
  if (wasOpen) {
    buttonAndBar.removeClass(openCls);
    maybeImportHtml(barElem, false);
  } else {
    buttonAndBar.addClass(openCls);
    maybeImportHtml(barElem, viewer.$refs);
  }
}


module.exports = toggleDetailBar;
