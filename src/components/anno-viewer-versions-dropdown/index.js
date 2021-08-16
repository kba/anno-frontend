const bootstrapCompat = require('../../bootstrap-compat');

module.exports = {

  template: require('./versions.html'),
  style: [
    require('./style.scss'),
  ],

  mixins: [
    require('../../mixin/l10n'),
    require('../../mixin/dateFmt'),
  ],

  data() {
    return {
      bootstrapOpts: bootstrapCompat.sharedConfig,
    }
  },

  computed: {
    versionsList() { return (this.anno.hasVersion || [this.anno]); },
  },

  props: {
    onSelectVersion: { type: [Function] },
    anno: { type: [Object] },
  },

};
