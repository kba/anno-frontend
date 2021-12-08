// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

window.jQuery().ready(function installLate() {
  const { testUtil } = window;
  const decodeJWT = window.jwt_decode;
  const { ifr } = window.frames;
  const jq = window.jQuery;
  const cfg = window.annoServerCfg;
  const {
    annoEndpoint,
    tokenEndpoint,
  } = cfg;
  const annoEndpointAbs = cfg.resolveURL(annoEndpoint);

  const loginFormAttrs = {
    method: 'post',
    action: cfg.loginFormUrl.replace(/\&from=[ -%'-~]*/, ''),
    target: ifr.name,
  };
  ifr.location.href = loginFormAttrs.action;
  const plainAuthPanel = testUtil.addTestsPanel('Insecure plain auth');
  plainAuthPanel.addForm(`
    <p>
      👤<input type="text" size="10" name="username">
      🔑<input type="text" size="10" name="password" value="xyzzy">
      <input type="submit" value="⏎">
    </p>
  `, loginFormAttrs);
  plainAuthPanel.addForm(`
    <p>
      📛<input type="hidden" name="password" value="xyzzy">
      <input type="submit" name="username" value="admin">
      <input type="submit" name="username" value="alice">
      <input type="submit" name="username" value="bob">
      <input type="submit" name="username" value="john">
    </p>
  `, loginFormAttrs);


  const aclMonPanel = testUtil.addTestsPanel('ACL monitor');
  aclMonPanel.addForm(`
    <p>Received at: <span ref="receivedAt">(soon?)</span><br>
      <textarea name="txa" cols="75" rows="30" wrap="off" class="code"
      ></textarea></p>
  `, function setup(form) {
    const { refs } = form;
    const { txa } = form.elements;
    const aclRequest = {
      method: 'post',
      url: annoEndpointAbs + 'anno/acl',
      contentType: 'application/json; charset=UTF-8',
      data: JSON.stringify({
        targets: [
          '*',
          annoEndpointAbs + 'anno/',
          annoEndpointAbs + 'anno/dummy',
        ],
      }, null, 2),
      dataType: 'text', // <-- don't auto-parse response
    };
    const jwtRequest = {
      method: 'get',
      url: tokenEndpoint,
      xhrFields: { withCredentials: true },
      dataType: 'text', // <-- don't auto-parse response
    };

    const autoUpd = jq(`<label class="text-nowrap pt-1 mr-2">
      <input type="checkbox"> auto&rarr;</label>`).find('input')[0];

    async function update() {
      autoUpd.timer(false);

      const jwtResp = await jq.ajax(jwtRequest)
        .then(decodeJWT)
        .then(testUtil.prettyPrintJson)
        .then(String, testUtil.err2str);

      const aclResp = await jq.ajax(aclRequest)
        .then(testUtil.prettyPrintJson)
        .then(String, testUtil.err2str);

      refs.receivedAt.textContent = testUtil.zDateHr();
      const all = [
        'JWT = ' + jwtResp,
        'ACL = ' + aclResp,
      ].join('\n');
      if (txa.value !== all) { txa.value = all; }
      if (autoUpd.checked) { autoUpd.timer(2e3); }
    }

    function maybeAutoUpdate() { if (autoUpd.checked) { update(); } }
    autoUpd.timer = testUtil.makeRetimer(maybeAutoUpdate);
    autoUpd.onclick = maybeAutoUpdate;
    setTimeout(update, 500);

    const buttons = testUtil.topRightSubmitButton(aclMonPanel, [
      update,
      { v: '🗝', f() { ifr.location.href = tokenEndpoint; } },
    ]);
    buttons.grp.prepend(autoUpd.parentNode);
  });
});
