// -*- coding: utf-8, tab-width: 2 -*-
'use strict';

const getOwn = require('getown');
const autoDefault = require('require-mjs-autoprefer-default-export-pmb');

const annoDataApi = autoDefault(require('../../annoDataApi'));

function notImpl() { throw new Error('not implemented'); }

window.ada = annoDataApi;

const EX = function bindDataApi(viewer) {
  return function dataApi(mthd, ...args) {
    try {
      return getOwn(annoDataApi, mthd, notImpl)(viewer.annotation, ...args);
    } catch (err) {
      err.message += (' in annoDataApi call "' + mthd
        + '" for Anno ID "' + viewer.id + '"');
      throw err;
    }
  };
};


module.exports = EX;
