'use strict';

module.exports = {
  methods: {
    determinePredicateCaption(predicateUrl) {
      const vueElem = this;
      const { l10n } = vueElem;
      let c = l10n('relationlink_predicate=' + predicateUrl, predicateUrl);
      c = c.replace(/^\w+\:\/*/, '');
      return c;
    },
  },
};
