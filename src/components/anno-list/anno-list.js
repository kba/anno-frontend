// -*- coding: utf-8, tab-width: 2 -*-
/*
 * ### anno-list
 *
 * List of [anno-viewer](#anno-viewer) components.
 *
 * #### Events
 *
 * - `create`: A new annotation on `targetSource` shall be created
 *
 * #### Methods
 *
 * ##### `collapseAll(state)`
 *
 * - `@param {String} state` Either `show` or `hide`
 *
 */
'use strict';

const eventBus = require('../../event-bus.js');
const HelpButton = require('../help-button');
const bootstrapCompat = require('../../bootstrap-compat.js');
const sessionStore = require('../../browserStorage.js').session;

/* eslint-disable global-require */
module.exports = {

  template: require('./anno-list.html'),
  style: require('./anno-list.scss'),

  mixins: [
    require('../../mixin/l10n.js'),
    require('../../mixin/auth.js'),
    require('../../mixin/api.js'),
    require('../../mixin/prefix.js'),
  ],

  components: {
    HelpButton,
  },

  data() {
    return {
      collapsed: true,
      bootstrapOpts: bootstrapCompat.sharedConfig,
    };
  },

  watch: {
    // https://v3.vuejs.org/api/instance-methods.html#watch
    list() {
      this.collapseAll('apply');
    },
  },

  mounted() {
    const annoList = this;

    (function restoreSessionSetting() {
      const ca = sessionStore.get('anno-list:collapsed');
      if (typeof ca === 'boolean') { annoList.collapsed = ca; }
    }());
    annoList.collapseAll('apply');

    // Sort the list initially and after every fetch
    annoList.sort();
    eventBus.$on('fetched', () => annoList.sort());

    // When permissions have been updated, force an update.
    eventBus.$on('updatedPermissions', () => annoList.$forceUpdate());

    // Initially open the list if there was an annotation persistently adressed
    if (annoList.purlId && annoList.purlAnnoInitiallyOpen) {
      eventBus.$once('fetched', () => {
        setTimeout(() => eventBus.$emit('expand', annoList.purlId), 1);
      });
    }
  },
  computed: {
    sortedBy() { return this.$store.state.annotationList.sortedBy; },
    list() { return this.$store.state.annotationList.list; },

    targetSource() { return this.$store.state.targetSource; },
    token() { return this.$store.state.token; },
    purlTemplate() { return this.$store.state.purlTemplate; },
    purlId() { return this.$store.state.purlId; },
    purlAnnoInitiallyOpen() { return this.$store.state.purlAnnoInitiallyOpen; },
    numberOfAnnotations() { return this.$store.getters.numberOfAnnotations; },

    isLoggedIn() { return this.$store.getters.isLoggedIn; },
    tokenDecoded() { return this.$store.getters.tokenDecoded; },

    logoutButtonVisible() {
      return Boolean(this.isLoggedIn && this.$store.state.logoutPageUrl);
    },

    logoutButtonUrl() {
      const ep = this.$store.state.logoutPageUrl;
      if (ep === 'fake://insecure') { return ''; }
      return ep;
    },

  },


  methods: {
    sort(...args) { return this.$store.dispatch('sort', ...args); },
    create() { return eventBus.$emit('create', this.targetSource); },

    logoutButtonClicked() { this.$store.dispatch('assumeLoggedOut'); },

    collapseAll(action) {
      const annoList = this;
      let st = annoList.collapsed;
      if (action === 'hide') { st = true; }
      if (action === 'show') { st = false; }
      if (action === 'toggle') { st = !st; }
      annoList.collapsed = st;
      if (action !== 'apply') { sessionStore.put('anno-list:collapsed', st); }

      const verb = (st ? 'hide' : 'show');
      annoList.$children.forEach(function maybeCollapse(viewer) {
        if (viewer.collapse) { viewer.collapse(verb); }
      });
    },

  },
};

