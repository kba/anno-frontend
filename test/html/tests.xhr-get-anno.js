// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

const jq = window.jQuery;

const ldr = {

  fromForm(form) {
    const tx = form.elements.txa.value;
    tx.replace(/,\n +/g, ', ').split(/\n/).forEach(ldr.oneBatch);
  },

  oneBatch(ln) {
    const s = ln.trim();
    if (!s) { return; }
    if (s.startsWith('#')) { return; }
    if (s.startsWith('{') || s.startsWith('[')) { return ldr.fromCeson(s); }
    if (s.match(/^(?:\w+:|\.{0,2}\/)/)) { return ldr.fromURL(s); }
    console.error('Unsupported anno spec:', [s]);
  },

  async fromCeson(input, opt) {
    try {
      await window.annoApp.externalRequest('ImportAnnosFromCeson',
        { data: input, ...opt });
    } catch (err) {
      console.error('Failed to import ceson:', { input }, err);
    }
  },

  urlMap: {
    ubhd: ['https://anno.ub.uni-heidelberg.de/anno/', ''],
    f: ['../fixtures/', '.mjs'],
  },

  async fromURL(url, opt) {
    const [, proto, remainder] = url.split(/^(\w+):/);
    const mapped = ldr.urlMap[proto];
    if (mapped) {
      const fullUrl = mapped.join(remainder);
      const hint = 'imported from ' + url;
      const mOpt = { ...opt };
      if (ldr.buttons.byName.trace.checked) {
        mOpt.mergeIntoEach = { 'skos:note': hint };
      }
      return ldr.fromURL(fullUrl, mOpt);
    }
    const data = await jq.ajax({ url, dataType: 'text' });
    ldr.fromCeson(data, opt);
  },
};


jq().ready(function installLate() {
  const { testUtil } = window;
  const panel = testUtil.addTestsPanel('Import annotations');
  const store = window.annoApp.$store;

  const defaultImportSpecs = (function findAndClean() {
    let dis = jq('meta#test-xhr-get-anno-default-imports').attr('value');
    dis = dis.replace(/\n +/g, '\n');
    dis = dis.trim();
    return dis;
  }());

  panel.addForm(`
    <p><textarea name="txa" cols="60" rows="4" wrap="off" class="code"
    ></textarea></p>
  `, function setup(form) {
    form.elements.txa.value = defaultImportSpecs;
    ldr.buttons = testUtil.topRightSubmitButton(form, [
      // eslint-disable-next-line camelcase
      { v: 'trace', ckb: true },
      function clear_list() { store.commit('REPLACE_LIST', []); },
      { v: 'import', f() { ldr.fromForm(form); } },
    ]);
  });
});
