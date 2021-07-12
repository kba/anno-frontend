module.exports = {

  template: require('./debug.html'),
  style: require('./debug.scss'),

  props: {
    annot:      { type: [Object, Boolean], default: false },
  },

};
