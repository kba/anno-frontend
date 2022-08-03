// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const vali = function validateEditorFields(onBehalfOfVueComponent) {
  console.debug('validateEditorFields', onBehalfOfVueComponent);
  window.onBehalf = onBehalfOfVueComponent;
  const {
    $store,
  } = onBehalfOfVueComponent; // <-- May or may not be the editor
  let {
    l10n,
  } = onBehalfOfVueComponent;

  const problems = [];
  if (!l10n) {
    l10n = String;
    problems.push('Validation component should provide l10n');
  }
  function mf(x) { problems.push(mf.pre + l10n(x)); }
  mf.pre = l10n('missing_required_field') + ' ';

  const anno = $store.state.editing;
  if (!anno.title) { mf('annofield_title'); }

  [].concat(anno.body || []).forEach(function verifyBody(body) {
    const {
      purpose,
      value,
    } = body;
    if (purpose === 'classifying') {
      const ok = (value
        && (value === body.label)
        && body.source);
      if (ok) { return; }
      problems.push(l10n('semtag_no_source_for')
        + ' ' + JSON.stringify(body.value || ''));
    }
  });

  if (!problems.length) { return true; }
  const ind = '• ';
  const msg = ind + problems.join('\n' + ind);
  window.alert(msg); // eslint-disable-line no-undef,no-alert
  return false;
};


module.exports = vali;
