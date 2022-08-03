/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
/*

Example config-override file

*/
(function () {
  'use strict';
  var cfg = window.annoServerCfg;

  cfg.annoEndpoint = 'https://anno.ub.uni-heidelberg.de/anno/';

  window.annoCfgSetUbStyleAuthServer(cfg.annoEndpoint + 'auth/');
}());
