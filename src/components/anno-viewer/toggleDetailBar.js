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


const EX = function toggleDetailBar(ev) {
  const viewer = this;
  const barName = (ev.barName
    || jq(ev.target).closest('button').data('detailbar'));
  if (!barName) { throw new Error('No detailbar name'); }
  const detBars = viewer.$refs.detailbars;
  const openCls = 'active';
  const barElem = detBars.querySelector('.detailbar-' + barName);
  if (!barElem) { throw new Error('No such detailbar: ' + barName); }
  const buttons = jq('button[data-detailbar="' + barName + '"]');
  buttons.andBar = jq([...buttons, barElem]);
  let wantOpen = ev.barWantOpen;
  if ((wantOpen === 'toggle') || (wantOpen === undefined)) {
    const wasOpen = buttons.first().hasClass(openCls);
    wantOpen = !wasOpen;
  }
  if (wantOpen) {
    buttons.andBar.addClass(openCls);
    maybeImportHtml(barElem, viewer.$refs);
  } else {
    buttons.andBar.removeClass(openCls);
    maybeImportHtml(barElem, false);
  }
};




module.exports = EX;
