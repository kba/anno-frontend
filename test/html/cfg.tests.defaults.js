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

  function appendFixtureAnnots() {
    // window.annoApp.$store.commit('CHANGE_ACL', { '*': { '*': true } });
    var fixt = window.annotations;
    if (!fixt) { return; }
    window.annoApp.$store.commit('INJECTED_MUTATION', [function append(state) {
      var alSt = state.annotationList;
      alSt.list = alSt.list.concat(fixt);
    }]);
  }

  jq('#tests-toolbar-bottom input[type=button]').each(function guessId(i, e) {
    if (e.id) { return i; }
    e.id = e.value.toLowerCase().match(/[a-z]+/g).join('-');
  });
  jq('#load-fixture-annotations')[0].onclick = appendFixtureAnnots;

  // cfg.onAppReady = function ready() {};

  window.annoTestCfg = cfg;
}());
