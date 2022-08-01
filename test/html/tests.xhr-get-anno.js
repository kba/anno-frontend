// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

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
    const data = await window.jQuery.ajax({ url, dataType: 'text' });
    ldr.fromCeson(data, opt);
  },
};


window.jQuery().ready(function installLate() {
  const { testUtil } = window;
  const panel = testUtil.addTestsPanel('Import annotations');
  const store = window.annoApp.$store;

  panel.addForm(`
    <p><textarea name="txa" cols="60" rows="4" wrap="off" class="code">
      f:empty_relation_link_predicate
      f:tags_and_doi
      f:heinrich_scheufelen_ein1183_auktion_hahn
      # ubhd:54eb5a09-df9f-3f1c-b18e-4676d1046166
      # f:clocktower
      # f:cpg389_red_dress
      # f:old
    </textarea></p>
  `, function setup(form) {
    const { txa } = form.elements;
    txa.value = txa.value.replace(/\n +/g, '\n').trim();
    ldr.buttons = testUtil.topRightSubmitButton(form, [
      // eslint-disable-next-line camelcase
      { v: 'trace', ckb: true },
      function clear_list() { store.commit('REPLACE_LIST', []); },
      { v: 'import', f() { ldr.fromForm(form); } },
    ]);
  });
});
