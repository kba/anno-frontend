const licensesInfo = require('../../../license-config.js');
const popoverHelper = require('../../popover-helper.js');

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
    popoverHelper.install(this.$el);
  },

};
