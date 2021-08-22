/* -*- tab-width: 2 -*- */
'use strict';
/* eslint-disable global-require */

module.exports = {

  template: require('./debug.html'),
  style: require('./debug.scss'),

  methods: {

    updateAcl(btn) {
      this.$store.commit((btn.a ? 'CHANGE_ACL' : 'EMPTY_ACL'), btn.a);
    },

  },

};
