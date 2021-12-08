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

    alwaysFalse() { return false; },

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
      const chap = jq('<chapter><aside><fieldset><legend><h3>');
      const headline = chap.find('h3');
      if (title) { headline.text(title); }
      chap.appendTo('body');
      const inner = chap.find('fieldset');
      Object.assign(inner, {

        headline,

        addForm(html, ...inits) {
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
          inits.forEach(function initForm(how) {
            if (!how) { return; }
            if (how.apply) { return how(form); }
            form.attr(how);
          });
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


    topRightSubmitButton(destForm, submitBtn, ...extraBtn) {
      const rel = jq('<div class="pull-right" style="position: relative;">');
      const grp = jq('<div class="btn-group">').appendTo(rel);
      grp[0].style = 'position: absolute; right: 0; bottom: 1em;';
      destForm.on('submit', tu.alwaysFalse);
      function addBtn(spec, idx) {
        const el = document.createElement('input');
        el.type = (spec.t || (idx && 'button') || 'submit');
        el.value = (spec.v || (spec.name || '').replace(/_/g, ' ') || spec);
        el.className = 'btn btn-default btn-sm btn-outline-secondary';
        const hnd = (spec.f || spec || false);
        if (hnd.apply) { el.onclick = hnd; }
        grp.append(el);
        return el;
      }
      const buttons = [].concat(submitBtn, ...extraBtn).map(addBtn);
      destForm.prepend(rel);
      Object.assign(buttons, { rel, grp });
      return buttons;
    },





  });







  /* scroll */
}());
