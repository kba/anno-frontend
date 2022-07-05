'use strict';

const makePredicatesCollection = require('./makePredicatesCollection.js');
const vraPredicateNames = require('./predi.vra.js');

const EX = makePredicatesCollection();

EX.add('rdf-schema', `
  seeAlso
`, 'http://www.w3.org/2000/01/%g#%v');


EX.add('dublin-core', `
  isPartOf
`, 'http://purl.org/dc/terms/%v');


EX.add('vra', vraPredicateNames,
  'http://purl.org/vra/%v');



module.exports = EX;
