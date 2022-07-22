'use strict';

const makePredicatesCollection = require('./makePredicatesCollection.js');
const dcRelations = require('./predi.dc.js');
const lidoRelations = require('./predi.lido.js');
// const vraPredicateNames = require('./predi.vra.js');

const EX = makePredicatesCollection();

EX.add('rdf-schema', `
  seeAlso
`, 'http://www.w3.org/2000/01/%g#%v');

// EX.add('vra', vraPredicateNames,
//   'http://purl.org/vra/%v');

EX.add('dublin-core', dcRelations,
  'http://purl.org/dc/terms/%v');

EX.add('lido', lidoRelations,
  'http://terminology.lido-schema.org/%g%v');

module.exports = EX;
