'use strict';

module.exports = {
  methods: {
    determinePredicateCaption(predicateUrl) {
      const vueElem = this;
      const { l10n } = vueElem;
      if (!predicateUrl) { return l10n('no_data'); }
      let c = l10n('relationlink_predicate=' + predicateUrl, predicateUrl);
      c = c.replace(/^\w+\:\/*(?=\S)/, '');
      return c;
    },
  },
};
