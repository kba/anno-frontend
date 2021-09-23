/* -*- tab-width: 2 -*- */
'use strict';

const WebStorageES6 = require('web-storage-es6');

const ns = 'ubhd210923anno';
const dbs = {};

function makeDb(type) {
  const db = new WebStorageES6('Session', ns);
  db.del = db.forget;
  dbs[type.toLowerCase()] = db;
}

// makeDb('Local');
makeDb('Session');

module.exports = dbs;
