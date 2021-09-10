// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

const tu = {};
window.testUtil = tu;

const jq = window.jQuery;

Object.assign(tu, {


  logPromise(descr, pr) {
    function onSuccess(val) {
      console.debug(descr + ': success', val);
      return val;
    }
    function onFail(err) {
      // eslint-disable-next-line no-alert
      window.alert('Error: ' + descr + ': ' + err);
      throw err;
    }
    return pr.then(onSuccess, onFail);
  },


  verboseXrq(action, params, descr) {
    console.debug('vxrq:', descr, action, params);
    const pr = window.annoApp.externalRequest(action, params);
    tu.logPromise((descr || action), pr);
  },


  addTestsPanel(title) {
    const chap = jq('<chapter><aside><fieldset><legend>');
    chap.find('legend').text(title);
    chap.appendTo('body');
    const inner = chap.find('fieldset');
    Object.assign(inner, {

      addForm(html, init) {
        const form = jq('<form>');
        form.attr({
          action: 'about+nope://',
          method: 'get',
          target: '_blank',
        });
        form.html(html);
        form.elements = form[0].elements;
        form.refs = {};
        form.find('[ref]').each((idx, el) => {
          form.refs[el.getAttribute('ref')] = el;
        });
        if (init) { init(form); }
        inner.append(form);
        return form;
      },

    });
    return inner;
  },




});
