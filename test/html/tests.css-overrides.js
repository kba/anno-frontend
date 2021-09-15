// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

const { testUtil } = window;
const jq = window.jQuery;

jq().ready(function installLate() {
  const panel = testUtil.addTestsPanel('Custom CSS Overrides');
  panel.addForm(`
    <div class="pull-right" style="position: relative;"><input
      type="submit" value="apply"
      class="btn btn-default btn-sm btn-outline-secondary"
      style="position: absolute; right: 0; bottom: 1ex;">
    </div>
    <textarea name="txa" cols="60" rows="15" wrap="off"
      style="border: 1px solid silver; overflow: scroll; resize: both;
        font-family: monospace; font-size: 85%;"
      ></textarea><style type="text/css"></style>
  `, function setup(form) {
    const { txa } = form.elements;
    const dest = txa.nextElementSibling;
    form.on('submit', function upd() {
      dest.innerHTML = txa.value;
      console.debug(dest, txa.value);
      return false;
    });
    txa.value = `
      #anno-app-container { max-width: 20em; }

      .media-body,
      .btn-toolbar,
      .btn-group,
      fx#maxw100 { max-width: 100%; overflow: auto; }

      .anno-editor-anno-body-buttonbar-top .btn {
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      `.replace(/^ {6}/mg, '').trim() + '\n';
  });
});
