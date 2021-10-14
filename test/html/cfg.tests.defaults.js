/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function () {
  'use strict';
  var jq = window.jQuery, cfg = {

    exportAppAsWindowProp: 'annoApp',
    // ^- In production, rather save the result of displayAnnotations.

    targetImage: ('https://upload.wikimedia.org/wikipedia/commons/thumb/'
      + 'f/fd/Ghostscript_Tiger.svg/1024px-Ghostscript_Tiger.svg.png'),

    uiDebugMode: true,
    acl: {
      '*': { '*': true },
      // 'debug:skipFetchAcl': true,
      // 'debug:override:isLoggedIn': true,
    },

    events: {},
  };

  cfg.targetSource = ('http://anno.test/' + location.pathname.replace(/^\S+\//,
    '').replace(/\.\S+$/, ''));

  cfg.targetThumbnail = cfg.targetImage.replace(/\/1024px-/g, '/200px-');

  jq().ready(function registerToolbarButtons() {
    var btn = window.testUtil.testButtonsToolbar.addBtn,
      fixt = window.annotations;
    btn(fixt && 'Load fixture annotations', function appendFixtureAnnots() {
      // window.annoApp.$store.commit('CHANGE_ACL', { '*': { '*': true } });
      function append(state) {
        var alSt = state.annotationList;
        alSt.list = alSt.list.concat(fixt);
      }
      window.annoApp.$store.commit('INJECTED_MUTATION', [append]);
    });
  });

  // cfg.onAppReady = function ready() {};

  window.annoTestCfg = cfg;
}());
