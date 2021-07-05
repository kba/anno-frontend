/* -*- tab-width: 2 -*- */
/* eslint-env browser */
'use strict';
(function install() {
  const { annoApp } = window;
  // ^- see exportAppAsWindowProp in cfg.tests.defaults.js

  // Cheat: Grab initial targetSource directly from editor config.
  const initialTargetSource = annoApp.$store.state.targetSource;

  const { jQuery } = window;
  const chap = jQuery(`
  <chapter><form action="about+nope://" method="get"><aside><fieldset>
    <legend>Fragment Selector Test</legend>
    <p><input type="submit" value="Beginne Entwurf"> für targetSource URL:
      <input type="text" name="url" size="50" value="">
    </p>
    <p>Beispiel-Abschnittte:
      <span id="frag-ex1">Hier <a href="#frag-ex1">ein</a> Test,</span>
      <span id="frag-ex2">und <a href="#frag-ex2">noch einer</a>. Doch</span>
      <span id="frag-ex3">aller <a href="#frag-ex3">guten Dinge</a>
        sind drei.</span>
    </p>
  </aside></fieldset></form></chapter>
  `);

  const form = chap.find('form')[0];
  form.elements.url.value = initialTargetSource + '#frag-ex1';

  form.onsubmit = function submitted() {
    const action = 'CreateAnnotationForTargetSource';
    const params = { targetSource: form.elements.url.value };
    function onSuccess() { console.debug(action + ': success'); }
    // eslint-disable-next-line no-alert
    function onFail(err) { window.alert('Error: ' + action + ': ' + err); }

    const xrqPromise = annoApp.externalRequest(action, params);
    xrqPromise.then(onSuccess, onFail);

    return false;
  };

  chap.appendTo('body');
}());
