const jQuery = require('jquery');

const HelpButton = require('../help-button');


function jqSetSingularClass(cls, idx, list) {
  jQuery(list).removeClass(cls).eq(idx).addClass(cls);
}


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
      const { panesContainer } = this.$refs;
      return this.$children.filter(c => (c.$el.parentNode === panesContainer));
    },

    switchToNthTab(n) {
      const idx = (+n || 0) - 1;
      const activate = jqSetSingularClass.bind(null, 'active', idx);
      // Highlight the correct tab in BS3:
      activate(this.$refs.tabs.children);
      // Highlight the correct tab in BS4:
      activate(this.$refs.tabs.querySelectorAll('.nav-link'));
      // Show only the relevant pane:
      activate(this.$refs.panesContainer.children);
    },

  },

  props: {
    helpUrlTemplate:  {type: String, required: true},
    helpUrlManual:    {type: String, required: false},
  },

};
