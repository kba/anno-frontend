const $ = require('jquery')
const eventBus = require('../event-bus')

/*
 * ### anno-editor-modal
 *
 * A bootstrap modal that holds a singleton [anno-editor](#anno-editor).
 *
 * Events: Same as in [anno-editor](#anno-editor)
 *
 */

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/auth'),
        require('../mixin/prefix'),
    ],
    props: {
        draggable: { type: Boolean, default: true },
        resizable: { type: Boolean, default: true },
    },
    template: require('./anno-editor-modal.html'),
    style:    require('./anno-editor-modal.scss'),
    computed: {
        id() { return this.$store.state.annotation.id },
        editor() { return this.$refs['editor'] },
    },
    created() {
        eventBus.$on('open-editor', () => this.show())
        eventBus.$on('close-editor', () => this.hide())
    },
    mounted() {

        const dialogEl = this.$el.querySelector('.modal-dialog')
        const contentEl = this.$el.querySelector('.modal-content')

        if (this.draggable) {
            let jQuery = $
            if (typeof jQuery().draggable !== 'function') jQuery = window.jQuery
            if (!jQuery || typeof jQuery().draggable !== 'function')
                console.error("draggable modal editor requires jquery ui")
            else {
                jQuery(dialogEl).draggable({
                    handle: '.modal-header'
                })
                dialogEl.classList.add('draggable')
            }
        }

        if (this.resizable) {
            let jQuery = $
            if (typeof jQuery().resizable !== 'function') jQuery = window.jQuery
            if (!jQuery || typeof jQuery().resizable !== 'function')
                console.error("resizable modal editor requires jquery ui")
            else {
                jQuery(contentEl).resizable({
                    alsoResize: ".modal-dialog",
                    minHeight: 300,
                    minWidth: 300
                })
                contentEl.classList.add('resizable')
                $(this.$el).on('show.bs.modal', function () {
                    $(this).find('.modal-body').css({'max-height': '100%'});
                });
            }
        }

    },
    methods: {
        save() { console.log("emit save") ;eventBus.$emit('save') },
        remove() { eventBus.$emit('remove', this.id) },
        discard() { eventBus.$emit('discard') },

        show(annotation) {
            $(this.$el).modal({
                keyboard: false,
                backdrop: 'static',
            })
        },
        hide() { $(this.$el).modal('hide') },
    },
}
