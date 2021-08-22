/* -*- tab-width: 2 -*- */
'use strict';

const licensesConfig = require('../license-config.js');

const byUrl = new Map();

const EX = {
  byUrl,
};


Object.entries(licensesConfig).forEach(function learn([licId, licDetails]) {
  const { url } = licDetails;
  if (!url) { throw new Error('License without URL: ' + licId); }
  if (byUrl.has(url)) {
    throw new Error('Duplicate license URL for ID ' + licId + ': ' + url);
  }
  byUrl.set(url, licDetails);
});






module.exports = EX;
