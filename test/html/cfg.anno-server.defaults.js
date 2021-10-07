/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function () {
  'use strict';
  var cfg = {}, host = location.hostname, port = (+location.port || 0),
    protoHost = location.protocol + '//' + host;
  if ((port === 80) || (port === 443)) { port = 0; }

  cfg.collection = 'default';
  cfg.annoEndpoint = protoHost + (port ? ':33321/' : '/anno/');

  function authSrv(baseURL) {
    var qsColl = '?c=' + encodeURIComponent(cfg.collection),
      qsCollFrom = qsColl + '&from=' + encodeURIComponent(location.href);
    cfg.tokenEndpoint = baseURL + 'token/' + cfg.collection;
    cfg.loginEndpoint = baseURL + 'login' + qsCollFrom;
    cfg.logoutEndpoint = baseURL + 'logout' + qsCollFrom;
    cfg.permissionsRequestFormUrl = baseURL + 'request' + qsColl;
  }
  window.annoCfgSetUbStyleAuthServer = authSrv;
  authSrv(protoHost + (port ? ':3008/' : '/anno/auth/'));

  window.annoServerCfg = cfg;
}());
