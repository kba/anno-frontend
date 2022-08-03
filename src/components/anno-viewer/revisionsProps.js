'use strict';
/*

  List of properties to be overwritten based on _revisions.
  Knowing them is required in order to delete properties that
  the new revision doesn't have but could have had.

  We provide them in a separate file in order to help external
  applications retrieve this list.

*/
module.exports = [
  'body',
  'created',
  'doi',
  'modified',
  'target',
  'title',
];
