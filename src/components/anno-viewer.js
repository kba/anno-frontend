const $ = require('jquery')
const _dateformat = require('dateformat')
const eventBus = require('../event-bus')
const {
    numberOf,
} = require('@kba/anno-util')
const {
    relationLinkBody,
    textualHtmlBody,
    simpleTagBody,
    semanticTagBody,
    svgSelectorResource
} = require('@kba/anno-queries')

/**
 * ### anno-viewer
 *
 * Show an annotation as a bootstrap panel.
 *
 * #### Props
 *
 * - **`annotation`**: The annotation this viewer shows
 * - `asReply`: Whether the annotation should be displayed as a reply (no
 *   colapsing, smaller etc.)
 * - `purlTemplate` A string template for the persistent URL. `{{ slug }}` will
 *   be replaced by the slug of the annotation
 * - `isPurl` A boolean to highlight the anno as targeted by a purl
 * - `collapseInitially`: Whether the anntotation should be collapsed after
 *   first render
 * - dateFormat: Format of date stamps. Default: `dd.mm.yyyy hh:MM:ss`
 *
 * #### Events
 *
 * - `revise`: This annotation should be opened in an editor for revision
 * - `reply`: A new annotation as a reply to this annotation should be opened in an editor
 * - `remove`: This annotation should be removed from the store
 * - `startHighlighting`: Start highlighting this annotation
 * - `stopHighlighting`: Stop highlighting this annotation
 * - `mouseenter`: The mouse cursor is now on this annotation
 * - `mouseleave`: The mouse cursor has left this annotation
 */

module.exports = {
    mixins: [
        require('../mixin/l10n'),
        require('../mixin/auth'),
        require('../mixin/prefix'),
    ],
    name: 'anno-viewer', // necessary for nesting
    props: {
        annotation: {type: Object, required: true},
        purlTemplate: {type: String, required: false},
        isPurl: {type: Boolean, required: false},
        // Controls whether comment is collapsible or not
        asReply: {type: Boolean, default: false},
        collapseInitially: {type: Boolean, default: false},
        dateFormat: {type: String, default: 'dd.mm.yyyy HH:MM:ss'},
    },
    template: require('./anno-viewer.html'),
    style:    require('./anno-viewer.scss'),
    mounted() {
        // Show popover with persistent URL
        const Clipboard = require('clipboard')
        const purlPopoverTrigger = this.$el.querySelector('[data-toggle="popover"]')
        $(purlPopoverTrigger).popover(); 
        $(purlPopoverTrigger).on('shown.bs.popover', function() {
            const purlPopoverDiv = purlPopoverTrigger.nextElementSibling
            const clip = new Clipboard(purlPopoverDiv.querySelector("[data-clipboard-text]"))
        })

        // React to highlighting events startHighlighting / stopHighlighting / toggleHighlighting
        ;['start', 'stop', 'toggle'].forEach(state => {
            const method = `${state}Highlighting`
            eventBus.$on(method, (id, open) => { if (id == this.id) this[method](open) })
        })
    },
    computed: {
        firstHtmlBody()      { return textualHtmlBody.first(this.annotation) },
        simpleTagBodies()    { return simpleTagBody.all(this.annotation) },
        semanticTagBodies()  { return semanticTagBody.all(this.annotation) },
        relationLinkBodies() { return relationLinkBody.all(this.annotation) },
        svgTarget()          { return svgSelectorResource.first(this.annotation) },
        id() { return this.annotation.id },
        purl() { return this.purlTemplate 
                ? this.purlTemplate.replace('{{ slug }}', this.id.replace(/.*\//, ''))
                : this.id },
        slug() {
            if (!this.annotation.id) return 'unsaved-annotation-' + Date.now()
            return this.annotation.id.replace(/[^A-Za-z0-9]/g, '')
        },
    },
    data() {
        return {
            currentVersion: this.initialAnnotation,
            highlighted: false,
            collapsed: this.collapseInitially,
        }
    },
    methods: {
        revise()     { return eventBus.$emit('revise', this.annotation) },
        reply()      { return eventBus.$emit('reply',  this.annotation) },
        remove()     { return eventBus.$emit('remove', this.annotation) },
        mouseenter() {
            this.startHighlighting()
            eventBus.$emit("mouseenter", this.id)
        },
        mouseleave() {
            this.stopHighlighting()
            eventBus.$emit("mouseleave", this.id)
        },
        isNewestVersion() {
            const anno = this.annotation
            if (!anno.hasVersion || anno.hasVersion.length == 1) return true
            const byDate = [...anno.hasVersion].sort((b,a) =>  {
                a = a.created || 0
                b = b.created || 0
                return !(a||b) ? 0 : !a ? +1 : !b ? -1 : a < b ? -1 : a > b ? +1 : 0
            })
            return byDate[0].id === anno.id || byDate[0].created === anno.created
        },

        startHighlighting(open)  {
            this.highlighted = true;
            if (open) this.collapsed = false
        },
        stopHighlighting()   { this.highlighted = false },
        toggleHighlighting() { this.highlighted = ! this.highlighted },

        dateformat(date) { return date ? _dateformat(date, this.dateFormat) : '' },
        collapse(collapseState) {
            this.collapsed = collapseState === 'toggle' ? ! this.collapsed : collapseState === 'hide'
        },
        numberOf(k) { return numberOf(this.annotation, k) },
        setToVersion(newState) {
            Object.assign(this.annotation, newState)
            eventBus.$emit('setToVersion', this.annotation)
            // this.$store.commit('RESET_ANNOTATION')
            // this.$store.commit('REPLACE_ANNOTATION', newState)
        }
    },
}
