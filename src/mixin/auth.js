/**
 * ### `this.$auth(cond, [id])`
 *
 * Check authorization of user against `$store.state.acl`
 *
 * - `$auth(<cond>, <url>)` should be read as "Is the current user
 *   authorized to apply action `<cond>` on `<url>`"
 *
 */

const getOwn = require('getown');

const knownConditions = [
  'create',
  'mintDoi',
  'read',
  'remove',
  'revise',
];


function authApiError(msg) {
  console.error('Anno Editor ACL ckeck API error:', msg);
  // throw new Error(msg);
  return false;
}


function checkAuth(cond, id) {
  if (!knownConditions.includes(cond)) {
    return authApiError('Unsupported ACL condition (operation): ' + cond);
  }
  if (!id ) {
    // return authApiError('No ID given for ACL check, condition=' + cond);
    return false;
  }
  const { acl } = this.$store.state;
  if (!acl) {
    // console.warn("Not logged in")
    return false;
  }

  let rulesForId = getOwn(acl, id);
  if (rulesForId === undefined) { rulesForId  = getOwn(acl, '*'); }
  if (!rulesForId) {
    // console.warn(`No auth permissions info for ${id}, denying.`)
    return false;
  }

  const origPermSpec = getOwn(rulesForId, cond, rulesForId['*']);
  if (!origPermSpec) { return false; }
  if (origPermSpec === true) { return true; }
  const errMsg = ('Unexpected detailed permissions data for condition '
    + cond + ' for annotation ID ' + id);
  throw new TypeError(errMsg);
};


module.exports = {
  methods: {
    $auth: checkAuth,
  },
};
