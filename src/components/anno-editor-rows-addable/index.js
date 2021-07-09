module.exports = {
  mixins: [
    // require('../../mixin/l10n'),
  ],

  props: {
    numberOfRows:     { type: Number, required: true },
  },

  template: require('./rows.html'),
};
