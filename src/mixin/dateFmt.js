'use strict';

const dateFormatLib = require('dateformat');

function dateFmt(ts) {
  if ((!ts) && (ts !== 0)) { return ''; }
  const fmt = this.l10n('dateformat');
  try {
    return dateFormatLib(ts, fmt);
  } catch (err) {
    console.error('E: dateFmt:', { ts, fmt }, err);
    return ('[date format error, input<'
      + (typeof ts) + '>=' + String(ts) + ']');
  }
}

module.exports = {
  methods: {
    dateFmt,
  },
};
