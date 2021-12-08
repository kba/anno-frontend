// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

window.jQuery().ready(function installLate() {
  const { testUtil } = window;
  const jq = window.jQuery;
  const cfg = window.annoServerCfg;
  const {
    annoEndpoint,
    // tokenEndpoint,
  } = cfg;

  const loginFormAttrs = {
    method: 'post',
    action: cfg.loginFormUrl.replace(/\&from=[ -%'-~]*/, ''),
    target: 'ifr',
  };
  window.frames.ifr.location.href = loginFormAttrs.action;
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
      <textarea name="txa" cols="60" rows="10" wrap="off" class="code"
      ></textarea></p>
  `, function setup(form) {
    const { txa } = form.elements;
    const aclRequest = {
      method: 'post',
      url: annoEndpoint + 'anno/acl',
      contentType: 'application/json; charset=UTF-8',
      data: JSON.stringify({
        targets: [
          '*',
          annoEndpoint + 'anno/',
          annoEndpoint + 'anno/dummy',
        ],
      }, null, 2),
      dataType: 'text', // <-- don't auto-parse response
    };

    async function update() {
      update.timer(false);
      let resp = await jq.ajax(aclRequest).then(String, String);
      form.refs.receivedAt.textContent = testUtil.zDateHr();
      if (resp.startsWith('{')) {
        try {
          resp = JSON.stringify(JSON.parse(resp), null, 2);
        } finally {
        }
      }
      if (txa.value !== resp) { txa.value = resp; }
      if (update.autoUpd.checked) { update.timer(2e3); }
    }
    update.timer = testUtil.makeRetimer(update, 1e3);

    const buttons = testUtil.topRightSubmitButton(aclMonPanel, update);
    update.autoUpd = jq(`<label class="text-nowrap pt-1 mr-2">
      <input type="checkbox" checked="checked"> auto&rarr;</label>
      `).prependTo(buttons.grp).find('input')[0];
  });
});
