const $ = require('jquery')
const eventBus = require('@/event-bus')
const HelpButton = require('@/components/help-button')

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
        require('@/mixin/l10n'),
        require('@/mixin/auth'),
        require('@/mixin/prefix'),
    ],
    components: {HelpButton},
    props: {
        draggable: {type: Boolean, default: true},
        resizable: {type: Boolean, default: true},
    },
    template: require('./anno-editor-modal.html'),
    style:    require('./anno-editor-modal.scss'),
    computed: {
        id()           {return this.$store.state.editing.id},
        doi()          {return this.$store.state.editing.doi},
        purlTemplate() {return this.$store.state.purlTemplate},
        editMode()     {return this.$store.state.editMode},
        replyTo()      {return this.$store.state.editing.replyTo},
        editor()       {return this.$refs['editor']},
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
                    $(this).find('.modal-body').css({'max-height': '100%'})
                })
            }
        }

    },
    methods: {
        editMode() {return this.$store.state.editMode},
        save() {eventBus.$emit('save')},
        remove() {eventBus.$emit('remove', this.id)},
        mintDoi() {eventBus.$emit('mintDoi')},
        discard() {eventBus.$emit('discard')},
        startHighlighting(...args) {eventBus.$emit('startHighlighting', ...args)},
        stopHighlighting(...args) {eventBus.$emit('stopHighlighting', ...args)},

        show(annotation) {
            $(this.$el).modal({
                keyboard: false,
                backdrop: 'static',
            })
        },
        hide() {$(this.$el).modal('hide')},
        purl(id) {
            return (this.purlTemplate && id)
                ? this.purlTemplate
                    .replace('{{ slug }}', id.replace(/.*\//, ''))
                : id ? id : ''
        },
    },
}
