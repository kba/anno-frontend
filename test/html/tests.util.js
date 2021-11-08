// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';
(function setupTestUtils() {
  const tu = {};
  const jq = window.jQuery;

  document.body.dataset.htmlFile = window.location.pathname.split('/'
  ).slice(-1)[0].replace(/(\.nm|)\.html$/, '');

  Object.assign(window, {
    testUtil: tu,
    jc(x) { return JSON.parse(JSON.stringify(x)); },
  });

  Object.assign(tu, {

    objTypeTag(x) {
      return (((x && typeof x) === 'object')
        && Object.prototype.toString.call(x).slice(8, -1));
    },


    convertSetToSortedArray(x) { return Array.from(x.values()).sort(); },


    convertMapToStringKeyedDict(x) {
      const d = {};
      const keys = Array.from(x.keys()).map(String);
      keys.sort().forEach(function preallocate(k) { d[k] = 0; });
      x.forEach((v, k) => { d[String(k)] = v; });
      return d;
    },


    wrappedConvert(mthd, orig) {
      return { ['<<< ' + mthd + ' >>>']: tu[mthd](orig) };
    },


    alert(msg) {
      // eslint-disable-next-line no-alert
      window.alert(msg);
    },


    logPromise(descr, pr) {
      function onSuccess(val) {
        console.debug(descr + ': success', val);
        return val;
      }
      function onFail(err) {
        tu.alert('Error: ' + descr + ': ' + err);
        throw err;
      }
      return pr.then(onSuccess, onFail);
    },


    async verboseXrq(action, params, descr) {
      const logPrefix = 'vxrq:' + (descr || action || 'nondescript');
      console.debug(logPrefix, params);
      const xrqPr = window.annoApp.externalRequest(action, params);
      const report = await tu.logPromise(logPrefix, xrqPr);
      window.vxrqReport = report;
      // tu.alert(logPrefix + ' success: ' + tu.jsonDump(report));
      return report;
    },


    addTestsPanel(title) {
      const chap = jq('<chapter><aside><fieldset><legend>');
      const headline = chap.find('legend');
      if (title) { headline.text(title); }
      chap.appendTo('body');
      const inner = chap.find('fieldset');
      Object.assign(inner, {

        headline,

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


    jsonDump: (function compile() {
      const wc = tu.wrappedConvert;
      function convert(k, v) {
        const tt = tu.objTypeTag(v);
        console.debug('convert:', tt, k, v);
        if (!tt) { return v; }
        if (tt === 'Set') { return wc('convertSetToSortedArray', v); }
        if (tt === 'Map') { return wc('convertMapToStringKeyedDict', v); }
        return v;
      }
      function dump(x) {
        if (x === '') { return '""'; }
        if (!x) { return String(x); }
        return JSON.stringify(x, convert, 2);
      }
      return dump;
    }()),





  });








  tu.testButtonsToolbar = tu.addTestsPanel().addForm(`
    <div id="tests-toolbar-bottom" class="btn-group">
    </div>
  `, function init(form) {
    form.on('submit', () => false);
  }).find('.btn-group').first();
  tu.testButtonsToolbar.addBtn = function addBtn(value, onclick, props) {
    if (!value) { return false; }
    const btn = jq('<input type="submit">');
    Object.assign(btn[0], { ...props, value, onclick });
    tu.testButtonsToolbar.append(btn);
    return btn;
  };




  /* scroll */
}());
