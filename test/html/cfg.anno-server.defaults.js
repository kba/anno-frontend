/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function () {
  'use strict';
  var cfg = {}, host = location.hostname, port = (+location.port || 0),
    protoHost = location.protocol + '//' + host;
  if ((port === 80) || (port === 443)) { port = 0; }

  cfg.collection = 'default';
  cfg.annoEndpoint = protoHost + (port ? ':33321/' : '/anno/');

  (function compile() {
    var l = document.createElement('a');
    cfg.resolveURL = function resolveURL(url) {
      l.href = url;
      return l.href;
    };
  }());

  function authSrv(baseURL) {
    var ueColl = encodeURIComponent(cfg.collection),
      fromUrl = window.location.href,
      qsCollFrom = ('?c=' + ueColl + '&from=' + encodeURIComponent(fromUrl));
    cfg.tokenEndpoint = baseURL + 'token/' + ueColl;
    cfg.loginFormUrl = baseURL + 'login' + qsCollFrom;
    cfg.logoutPageUrl = baseURL + 'logout' + qsCollFrom;
    cfg.loginRegistrationFormUrl = baseURL + 'register' + qsCollFrom;
    cfg.permissionsRequestFormUrl = baseURL + 'request' + qsCollFrom;
  }
  window.annoCfgSetUbStyleAuthServer = authSrv;
  authSrv(protoHost + (port ? ':3008/' : '/anno/auth/'));

  cfg.fixBogusRemoteAnnoEndpoint = function (badEndpointRgx) {
    if (!badEndpointRgx) { badEndpointRgx = /^\S+?\/anno\//; }
    var r = cfg.resolveURL;
    function fix(u) { return u.replace(badEndpointRgx, r(cfg.annoEndpoint)); }
    cfg.customSaveLegacyPreArgsFactories = {
      reply: function reply(anno) { return [fix(anno.replyTo)]; },
      revise: function revise(anno) { return [fix(anno.id)]; },
    };
  };

  window.annoServerCfg = cfg;
}());
