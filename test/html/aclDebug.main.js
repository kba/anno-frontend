// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

window.jQuery().ready(function installLate() {
  const { testUtil } = window;
  const jq = window.jQuery;
  const cfg = window.annoServerCfg;

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

});
