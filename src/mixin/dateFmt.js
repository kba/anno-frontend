'use strict';

const dateFormatLib = require('dateformat');

function dateFmt(ts) {
  if ((!ts) && (ts !== 0)) { return ''; }
  return dateFormatLib(ts, this.l10n('dateformat'));
}

module.exports = {
  methods: {
    dateFmt,
  },
};
