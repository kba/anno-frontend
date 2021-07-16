/*
 * ### sidebar-app
 *
 * Container for the list of annotations for a target and a modal editor to
 * edit/create new annotations.
 *
 * #### Props
 *
 * - `collapseInitially`: Whether the annotation list should be collapsed after loading
 * - `standalone`: Whether the sidebar should inject it's own
 *   toggleing/container elements or reuse existing DOM elements. If the
 *   latter, `el` must be set. See [`displayAnnotations`](#displayannotations)
 *
 *
 */

const eventBus = require('../../event-bus');
const bootstrapCompat = require('../../bootstrap-compat');

module.exports = {
    props: {
        collapseInitially: {type: Boolean, default: false},
        standalone: {type: Boolean, default: false},
    },
    mixins: [
        require('@/mixin/prefix'),
        require('@/mixin/l10n'),
    ],
    style: require('./sidebar-app.scss'),
    template: require('./sidebar-app.html'),

    data() {return {
        collapsed: this.collapseInitially,
        bootstrapOpts: bootstrapCompat.sharedConfig,
        msgBoxes: [],
    }},

    computed: {
      numberOfAnnotations() { return this.$store.getters.numberOfAnnotations; },

      noAnnotsReason() {
        const app = this;
        const alSt = app.$store.state.annotationList;
        if (alSt.list.length) { return false; }
        const loadFail = alSt.fetchFailed;
        const code = ((alSt.fetching && 'loading')
          || (loadFail && 'loadfail')
          || 'empty');
        const reason = { code, msg: app.l10n('anno_list:' + code) };
        if (code === 'loadfail') {
          reason.msg += ' ' + String(loadFail);
          reason.err = loadFail;
        }
        return reason;
      },
    },

    methods: {

      toggle() { this.collapsed = !this.collapsed; },

      discardMsgBox(box) {
        this.msgBoxes = this.msgBoxes.filter(b => (b !== box));
      },

    },

    mounted() {
      const sidebarApp = this;
      eventBus.$on('error', function displayError(err) {
        const box = {
          cls: 'error',
          msg: sidebarApp.l10n('error:') + ' ' + String(err),
          err,
        };
        Object.freeze(box);
        sidebarApp.msgBoxes.push(box);
      });
    },
}
