/* -*- tab-width: 2 -*- */
'use strict';

const getOwn = require('getown');

const topCssMeta = require('./mixin/toplevel-css.js').IMPL;

const browserWindow = window; // eslint-disable-line no-undef
const { jQuery } = browserWindow;

const EX = {};

const shortEventNames = {
  // https://getbootstrap.com/docs/4.1/components/popovers/#events
  popup: 'shown.bs.popover',
};



function jqFirstOrFalse(id, sub) {
  if (!id) { return false; }
  const found = jQuery('#' + id + ' ' + (sub || ''));
  return (found[0] || false);
}


function upgradeEvent(ev, hndFunc) {
  const trig = ev.target;
  const popupId = (trig.getAttribute('aria-describedby') || '');
  return hndFunc({
    ...ev,
    triggerElem: trig,
    popupId,
    popupElem: jqFirstOrFalse(popupId),
    popupBody: jqFirstOrFalse(popupId, '.popover-content'),
  });
}


function install(baseElem, origOpt) {
  const jqBase = jQuery(baseElem);
  let poTriggers = jqBase;
  const opt = {
    container: (jqBase.closest('.' + topCssMeta.cssNamespaceClass)[0]
      || browserWindow.document.body),
    subSel: '[data-toggle="popover"]',
    placement: 'bottom',
    html: true,
    ...origOpt,
  };

  const { subSel } = opt;
  delete opt.subSel;
  if (subSel) { poTriggers = poTriggers.find(subSel); }

  const eventHandlers = (opt.on || false);
  delete opt.on;
  Object.entries(eventHandlers).forEach(([origEventName, hndFunc]) => {
    const evName = getOwn(shortEventNames, origEventName, origEventName);
    jqBase.on(evName, (subSel || null), ev => upgradeEvent(ev, hndFunc));
  });

  poTriggers.popover(opt);
}



Object.assign(EX, {
  install,
});

module.exports = EX;
