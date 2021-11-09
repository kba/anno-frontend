/* -*- tab-width: 2 -*- */
'use strict';

const parseCeson = require('ceson/parse.js');

async function doImportAnnosFromCeson(vuexApi, cesonText) {
  const { annoApp } = this;
  const cesonData = parseCeson(cesonText);
  const annos = [].concat(cesonData).filter(Boolean);
  console.debug('xrq: ImportAnnosFromCeson:', { cesonText, cesonData, annos });

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
