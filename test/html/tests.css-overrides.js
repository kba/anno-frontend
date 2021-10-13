// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

window.jQuery().ready(function installLate() {
  const { testUtil } = window;
  const jq = window.jQuery;

  const panel = testUtil.addTestsPanel('Custom CSS Overrides');
  const sidebarMaxWidthOptions = [
    '20em',
    '30em',
    '40em',
    'unset',
  ].map(v => ('<label><input type="radio" name="sidebarMaxWidth" value="'
    + v + '"> ' + v + '</label>')).join(' ');
  panel.addForm(`
    <div class="pull-right" style="position: relative;"><input
      type="submit" value="apply"
      class="btn btn-default btn-sm btn-outline-secondary"
      style="position: absolute; right: 0; bottom: 1em;">
    </div>
    <p>Sidebar max-width: ${sidebarMaxWidthOptions}</p>
    <p><textarea name="txa" cols="60" rows="2" wrap="off"
      style="border: 1px solid silver; overflow: scroll; resize: both;
        font-family: monospace; font-size: 85%;"
      ></textarea><style type="text/css"></style></p>
  `, function setup(form) {
    const { txa } = form.elements;
    function fv(n) { return form.elements[n].value; }
    const dest = txa.nextElementSibling;
    function upd() {
      let css = `
        .sidebar-container { max-width: ${fv('sidebarMaxWidth')}; }
        `;
      form.find('input[type=checkbox]').each((idx, ckb) => {
        if (!ckb.checked) { return; }
        const slots = jq(ckb).closest('p').find('input[type=text]').toArray();
        const add = ckb.value.replace(/¤/g, () => slots.shift().value);
        css += add + '\n';
      });
      css += txa.value;
      dest.innerHTML = css.trim();
    }
    form.on('submit', () => { upd(); return false; });
    form.on('click', 'input[type="checkbox"],input[type="radio"]', upd);
    txa.value = `
      `.replace(/^ {6}/mg, '').trim() + '\n';
    txa.rows = (+(txa.value.match(/\n/g) || false).length || 0) + 2;
  });
});
