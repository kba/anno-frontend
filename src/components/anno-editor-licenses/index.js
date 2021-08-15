const licensesInfo = require('../../../license-config.js');

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
    $(this.$el).find('[data-toggle="popover"]').popover({
      container: '#annoeditor-license-select',
    });
  },

};
