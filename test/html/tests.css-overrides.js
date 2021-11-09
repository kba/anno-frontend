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
    '60em',
    'unset',
  ].map(v => ('<label><input type="radio" name="sidebarMaxWidth" value="'
    + v + '"> ' + v + '</label>')).join(' ');
  panel.addForm(`
    <p>Sidebar max-width: ${sidebarMaxWidthOptions}</p>
    <p><textarea name="txa" cols="60" rows="2" wrap="off" class="code"
      ></textarea><style type="text/css"></style></p>
  `, function setup(form) {
    const { txa } = form.elements;
    function fv(n) { return form.elements[n].value; }
    const dest = txa.nextElementSibling;
    function apply() {
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
    testUtil.topRightSubmitButton(form, apply);
    form.on('click', 'input[type="checkbox"],input[type="radio"]', apply);
    txa.value = `
      `.replace(/^ {6}/mg, '').trim() + '\n';
    txa.rows = (+(txa.value.match(/\n/g) || false).length || 0) + 2;
  });
});
