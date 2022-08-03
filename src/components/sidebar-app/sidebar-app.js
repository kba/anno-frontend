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

module.exports = {
    props: {
        collapseInitially: {type: Boolean, default: false},
        standalone: {type: Boolean, default: false},
    },
    mixins: [
        require('../../mixin/l10n.js'),
        require('../../mixin/prefix.js'),
        require('../../mixin/toplevel-css.js'),
    ],

    template: require('./sidebar-app.html'),
    style: [
      require('./sidebar-app.scss'),
      require('./bootstrap-tweaks.scss'),
    ],

    data() {return {
        collapsed: this.collapseInitially,
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
          msgTypePrefix: sidebarApp.l10n('error:'),
          msg: String(err),
          hint: err.hint,
          err,
        };
        Object.freeze(box);
        sidebarApp.msgBoxes.push(box);
      });
    },
}
