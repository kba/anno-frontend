/* -*- tab-width: 2 -*- */

function decideOptionDefaults(origBsOpt) {
  const bso = { ...origBsOpt };
  const defaultTags = ({
    '3': {
      dropdownMenu: 'ul',
      dropdownMenuItem: 'li',
    },
    '4': {
      dropdownMenu: 'div',
      dropdownMenuItem: 'a',
      // ul+li seems to work for BS4 as well and would be more semantic,
      // but I couldn't find official compatibility info in the BS4 docs.
    },
  })[bso.version.major];
  if (!defaultTags) { throw new Error('Unsupported bootstrap version!'); }
  bso.tags = mergeOptions(defaultTags, bso.tags);
  return bso;
}

module.exports = {
  decideOptionDefaults,
};
