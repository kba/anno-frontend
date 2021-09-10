// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

const { testUtil } = window;
const jq = window.jQuery;


(function installEarly() {
  const cfg = window.annoTestCfg;

  function setUniqueCssClassByDomId(cls, domElemId) {
    const olds = Array.from(document.getElementsByClassName(cls));
    olds.forEach(el => el.classList.remove(cls));
    const cur = (domElemId && document.getElementById(domElemId));
    if (cur) { cur.classList.add(cls); }
  }

  cfg.targetFragmentButtonTitle = 'Absatz hervorheben';

  Object.assign(cfg.events, {

    targetFragmentButtonClicked(ev) {
      const fragId = ev.fragment;
      setUniqueCssClassByDomId('jumped-to', fragId);
      window.location.hash = '#' + fragId;
    },

    mouseenter(ev) {
      const fragId = ev.dataApi('findTargetFragment');
      setUniqueCssClassByDomId('hovering', fragId);
    },
    mouseleave() { setUniqueCssClassByDomId('hovering'); },

  });
}());


jq().ready(function installLate() {
  const { annoApp } = window;
  // ^- see exportAppAsWindowProp in cfg.tests.defaults.js
  const panel = testUtil.addTestsPanel('Fragment Selector Test');

  const imgRadios = [
    annoApp.$store.state.targetImage,
  ].filter(Boolean).concat('').map(function imgFmt(url, idx) {
    const htmlUrl = url.replace(/[<>"']/g, encodeURI).replace(/&/g, '&amp;');
    const caption = htmlUrl.split(/\//).slice(-1)[0].replace(/^\d+px-/, '');
    return ('\n      <label><input type="radio" name="image" value="'
      + htmlUrl + (idx ? '' : '" checked="checked') + '"> '
      + (caption || '(keines)') + '</label>');
  }).join('');


  panel.addForm(`
    <p><input type="submit" value="Beginne Entwurf"> für targetFragment:
      <tt>#</tt><input type="text" name="frag" size="20" value="">
    </p>
    <p>und Bilddatei: ${imgRadios}</p>
  `, function setup(form) {
    const fel = form.elements;
    fel.frag.value = 'frag-ex1';
    form.on('submit', function submitted() {
      testUtil.verboseXrq('ConfigureTargetAndComposeAnnotation', {
        targetImage: (fel.image.value || null),
        targetFragment: (fel.frag.value || null),
      });
      return false;
    });
  });


  panel.addForm(`
    <style type="text/css">
      body.has-annoeditor-showing .fragment-examples span { display: block; }
      .fragment-examples .jumped-to { background-color: khaki; }
      .fragment-examples .hovering { background-color: lightgreen; }
    </style>
    <p class="fragment-examples">Beispiel-Abschnittte:
      <span id="frag-ex1">Hier <a href="#frag-ex1">ein</a> Test,</span>
      <span id="frag-ex2">und <a href="#frag-ex2">noch einer</a>. Doch</span>
      <span id="frag-ex3">aller <a href="#frag-ex3">guten Dinge</a>
        sind drei.</span>
    </p>
  `, function setup(form) {
    async function setHighlightByFragment(fragmentId) {
      const values = {};
      if (fragmentId) {
        values[fragmentId] = true; // highlight this fragment
      }
      testUtil.verboseXrq('HighlightByTargetSelector', {
        selector: 'fragment',
        values,
        others: false, // un-highlight all others
      });
    }

    form.find('.fragment-examples span').click(function onClick(ev) {
      const spanElem = jq(ev.target).closest('span')[0];
      setHighlightByFragment(spanElem.id);
    });
  });


  panel.addForm(`
    <p class="fragment-multi">Mehrere Abschnittte:
      <input type="text" size="20" name="frags"
        placeholder="(mit Leerzeichen getrennt)"
        value="frag-ex1 frag-ex2"
        ><input type="submit" value="hervorheben">
    </p>
  `, function setup(form) {
    form.on('submit', function multiHighlight() {
      const values = {};
      form.elements.frags.value.replace(/\S+/g,
        function addValue(m) { values[m] = true; });
      testUtil.verboseXrq('HighlightByTargetSelector', {
        selector: 'fragment',
        values,
        others: false, // un-highlight all others
      });
      return false;
    });
  });
});
