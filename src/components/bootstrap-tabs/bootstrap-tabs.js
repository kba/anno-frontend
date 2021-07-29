const jQuery = require('jquery');

const HelpButton = require('../help-button');

module.exports = {
  mixins: [
    require('@/mixin/l10n'),
  ],
  template: require('./bootstrap-tabs.html'),
  style: require('./bootstrap-tabs.scss'),
  components: {
    HelpButton,
  },
  methods: {
    tabPanesAsVueElements() {
      const tabContainer = jQuery(this.$el).find('.tab-content:first')[0];
      return this.$children.filter(c => (c.$el.parentNode === tabContainer));
    },
  },
  props: {
    helpUrlTemplate:    { type: String, required: true },
    helpUrlManual:      { type: String },
    rerenderTimestamp:  { type: Number, default: 0 },
  },
};
