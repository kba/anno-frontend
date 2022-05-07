/*
 * ### anno-editor-modal
 *
 * A bootstrap modal that holds a singleton [anno-editor](#anno-editor).
 *
 * Events: Same as in [anno-editor](#anno-editor)
 *
 */

const $ = require('jquery')
const eventBus = require('@/event-bus')
const HelpButton = require('@/components/help-button')
const bootstrapCompat = require('../../bootstrap-compat');

module.exports = {
    mixins: [
        require('../../mixin/annoUrls.js'),
        require('../../mixin/auth.js'),
        require('../../mixin/l10n.js'),
        require('../../mixin/prefix.js'),
        require('../../mixin/toplevel-css.js'),
    ],
    components: {HelpButton},
    data() {return {
      bootstrapOpts: bootstrapCompat.sharedConfig,
    }},
    template: require('./anno-editor-modal.html'),
    style:    require('./anno-editor-modal.scss'),
    computed: {
        id()           {return this.$store.state.editing.id},
        doi()          {return this.$store.state.editing.doi},
        editMode()     {return this.$store.state.editMode},
        replyTo()      {return this.$store.state.editing.replyTo},
        editor()       {return this.$refs['editor']},
    },

    created() {
      const vueDialog = this;
      eventBus.$on('open-editor', function openEditor() {
        vueDialog.show();
      });
      eventBus.$on('close-editor', function closeEditor() {
        vueDialog.$store.commit('SET_EDIT_MODE', '');
        vueDialog.hide();
      });
    },

    methods: {
        save() {eventBus.$emit('save')},
        remove() {eventBus.$emit('remove', this.id)},
        discard() {eventBus.$emit('discard')},
        startHighlighting(...args) {eventBus.$emit('startHighlighting', ...args)},
        stopHighlighting(...args) {eventBus.$emit('stopHighlighting', ...args)},

        updateModal(opt) {
          const vueDialog = this;
          const dialogDomElem = vueDialog.$refs.annoEditorDialog;
          $(dialogDomElem).modal(opt);
        },

        show(annotation) {
          this.updateModal({
            keyboard: false,
            backdrop: 'static',
          });
        },

        hide() { this.updateModal('hide'); },

    },

};
