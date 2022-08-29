// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

window.jQuery().ready(function installLate() {
  const { testUtil } = window;
  // const jq = window.jQuery;
  const cfg = window.annoServerCfg;
  const { annoEndpoint } = cfg;
  const annoEndpointAbs = cfg.resolveURL(annoEndpoint);

  const panel = testUtil.addTestsPanel('Custom POST');
  const tpl = testUtil.makeSlotTplFuncs({
    txf: '<p>¤: <input type="text" name="¤" size="30" value="¤"></p>',
    txa: ('<p>¤:<br><textarea name="¤" cols="80" rows="10" wrap="off"'
      + ' class="code"></textarea></p>'),
  });
  panel.addForm(`
    ${tpl.txf('Endpoint sub URL', 'subUrl', 'anno/')}
    ${tpl.txf('Content-Type', 'cType', 'application/json; charset=UTF-8')}
    ${tpl.txa('Raw body text to be sent:', 'bodyTxa')}
    ${tpl.txa("Server's response:", 'rspTxa')}
  `, function setup(form) {
    const { bodyTxa, rspTxa, cType } = form.elements;

    function setRsp(m) {
      rspTxa.value = '[' + testUtil.localTimeHr() + '] ' + m;
    }

    async function submit() {
      const request = {
        method: 'post',
        url: annoEndpointAbs + form.elements.subUrl.value,
        contentType: cType.value,
        data: bodyTxa.value,
        dataType: 'text', // <-- don't auto-parse response
      };
      setRsp('(Sending…)');
      const resp = await testUtil.ajax2str(request);
      setRsp(resp);
    }

    testUtil.topRightSubmitButton(panel, [
      { v: 'Fixtures', href: '../fixtures/' },
      submit,
    ]);
  });
});
