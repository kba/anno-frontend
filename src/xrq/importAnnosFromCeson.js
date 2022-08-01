/* -*- tab-width: 2 -*- */
'use strict';

const mergeOptions = require('merge-options');
const parseCeson = require('ceson/parse.js');


async function doImportAnnosFromCeson(vuexApi, how) {
  const { annoApp } = this;
  const cesonData = parseCeson(how.data);
  let annos = [].concat(cesonData);
  // console.debug('xrq: ImportAnnosFromCeson:', { cesonText, cesonData, annos });
  if (how.prepareEach) { annos = annos.map(how.prepareEach); }
  if (how.mergeIntoEach) {
    annos = annos.map(a => (a && mergeOptions(a, how.mergeIntoEach)));
  }
  if (how.refineEach) { annos = annos.map(how.refineEach); }
  annos = annos.filter(Boolean);

  function append(state) {
    const alSt = state.annotationList;
    alSt.list = alSt.list.concat(annos);
    // console.debug('xrq: ImportAnnosFromCeson: added.');
  }
  annoApp.$store.commit('INJECTED_MUTATION', [append]);
}

module.exports = {
  doImportAnnosFromCeson,
};
