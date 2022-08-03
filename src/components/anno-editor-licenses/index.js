const licensesInfo = require('../../../license-config.js');
const installPopOvers = require('../../popover-helper.js').install;

module.exports = {

  mixins: [
    require('../../mixin/l10n'),
    require('../../mixin/prefix'),
  ],

  template: require('./licenses.html'),
  style: require('./style.scss'),

  data() { return {
    licensesInfo,
  } },

  mounted() {
    installPopOvers(this.$el);
  },

};
