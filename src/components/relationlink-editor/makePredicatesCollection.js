'use strict';

const EX = function makePredicatesCollection() {
  const allUrls = [];
  allUrls.boundSlice = allUrls.slice.bind(allUrls);
  const preds = {
    allUrls,
    groups: new Map(),
    ...EX.api,
  };
  return preds;
};


EX.api = {

  add(groupName, values, pattern) {
    const preds = this;
    if (!Array.isArray(values)) {
      return preds.add(groupName, /\S+/g.exec(values), pattern);
    }
    Object.assign(values, { pattern });
    preds.groups.set(groupName, values);
    const pat = pattern.replace(/%g/g, groupName);
    preds.allUrls.push(...values.map(v => pat.replace(/%v/g, v)));
    return preds;
  },

};


module.exports = EX;
