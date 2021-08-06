/* -*- tab-width: 2 -*- */
/* eslint-env browser */
'use strict';
(function install() {
  const { annoApp } = window;
  // ^- see exportAppAsWindowProp in cfg.tests.defaults.js

  const imgRadios = [
    annoApp.$store.state.targetImage,
  ].filter(Boolean).concat('').map(function imgFmt(url, idx) {
    const htmlUrl = url.replace(/[<>"']/g, encodeURI).replace(/&/g, '&amp;');
    const caption = htmlUrl.split(/\//).slice(-1)[0].replace(/^\d+px-/, '');
    return ('\n      <label><input type="radio" name="image" value="'
      + htmlUrl + (idx ? '' : '" checked="checked') + '"> '
      + (caption || '(keines)') + '</label>');
  }).join('');

  const { jQuery } = window;
  const chap = jQuery(`
  <chapter><form action="about+nope://" method="get"><aside><fieldset>
    <legend>Fragment Selector Test</legend>
    <p><input type="submit" value="Beginne Entwurf"> für targetFragment:
      <tt>#</tt><input type="text" name="frag" size="20" value="">
    </p>
    <p>und Bilddatei:${imgRadios}
    </p>
    <style type="text/css">
      body.has-annoeditor-showing .fragment-examples span { display: block; }
    </style>
    <p class="fragment-examples">Beispiel-Abschnittte:
      <span id="frag-ex1">Hier <a href="#frag-ex1">ein</a> Test,</span>
      <span id="frag-ex2">und <a href="#frag-ex2">noch einer</a>. Doch</span>
      <span id="frag-ex3">aller <a href="#frag-ex3">guten Dinge</a>
        sind drei.</span>
    </p>
  </aside></fieldset></form></chapter>
  `);

  const form = chap.find('form')[0];
  form.elements.frag.value = 'frag-ex1';

  form.onsubmit = function submitted() {
    const action = 'ConfigureTargetAndComposeAnnotation';
    const params = {
      targetImage: (form.elements.image.value || null),
      targetFragment: (form.elements.frag.value || null),
    };

    function onSuccess() { console.debug(action + ': success'); }
    // eslint-disable-next-line no-alert
    function onFail(err) { window.alert('Error: ' + action + ': ' + err); }

    const xrqPromise = annoApp.externalRequest(action, params);
    xrqPromise.then(onSuccess, onFail);

    return false;
  };

  chap.appendTo('body');
}());
