/* -*- tab-width: 2 -*- */
'use strict';

const Clipboard = require('clipboard');

const browserWindow = window; // eslint-disable-line no-undef
const { jQuery } = browserWindow;

const EX = {

  optProp: 'clipboardHelperOpts',
  mgrProp: 'clipboardManager',

  setupButtons(baseElem, updatedOpts) {
    const triggers = Array.from(baseElem.querySelectorAll(
      '[data-clipboard-text]'));
    // console.debug('Clipboard buttons:', baseElem, 'setup:', opts, triggers);
    if (!triggers.length) { throw new Error('Found no clipboard buttons!'); }
    triggers.forEach(trig => EX.setupOneTrigger(trig, updatedOpts));
  },

  setupOneTrigger(trig, updatedOpts) {
    const oldOpts = trig[EX.optProp];
    const opts = { ...oldOpts, ...updatedOpts };
    trig[EX.optProp] = opts;
    if (trig[EX.mgrProp]) {
      // console.debug('Clipboard trigger:', trig, 'updated:', opts);
      return;
    }
    const mgr = new Clipboard(trig);
    // console.debug('Clipboard trigger:', trig, 'set up:', opts, { mgr });
    trig[EX.mgrProp] = mgr;
    const sxsElem = opts.successLabelElem;
    mgr.on('success', function sxs(evSxs) {
      // console.debug('Clipboard success!', { evSxs, sxsElem });
      if (sxsElem) {
        const transition = 'fast';
        jQuery(sxsElem).show(transition).delay(2e3).hide(transition);
        // transition is required because .delay() only works for
        // animations, not for instant switches. See the warning
        // about .show and .hide in the .delay docs.
      }
    });
    mgr.on('error', function err(evErr) {
      console.error('Clipboard error!', { evErr });
    });
  },

};


module.exports = EX;
