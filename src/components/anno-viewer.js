const $ = require('jquery')
const _dateformat = require('dateformat')
const eventBus = require('../event-bus')
const XrxUtils = require('semtonotes-utils')
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
 * - `purlId` The URL of the persistently adressed annotation
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
 * - `setToVersion`: Reset the currently edited annotation to the revision passed
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
        purlId: {type: String, required: false},
        // Controls whether comment is collapsible or not
        asReply: {type: Boolean, default: false},
        collapseInitially: {type: Boolean, default: false},
        imageWidth: {type: Number, default: -1},
        imageHeight: {type: Number, default: -1},
        iiifUrlTemplate: {type: String, default: null},
        dateFormat: {type: String, default: 'dd.mm.yyyy HH:MM:ss'},
    },
    template: require('./anno-viewer.html'),
    style:    require('./anno-viewer.scss'),
    mounted() {

        this.iiifLink = this._iiifLink()

        // Show popover with persistent URL
        const Clipboard = require('clipboard')
        Array.from(this.$el.querySelectorAll('[data-toggle="popover"]')).forEach(purlPopoverTrigger => {
            $(purlPopoverTrigger).popover({ container: 'body' }); 
            $(purlPopoverTrigger).on('shown.bs.popover', () => {
                setTimeout(() => {
                    const purlPopoverDiv = document.getElementById(purlPopoverTrigger.getAttribute("aria-describedby"))
                    const clip = new Clipboard(purlPopoverDiv.querySelector("[data-clipboard-text]"))
                    clip.on('success', () => {
                        const successLabel = $(".label-success", purlPopoverDiv)
                        successLabel.show()
                        setTimeout(() => $(successLabel).hide(), 2000)
                    })
                })
            })
        })

        // React to highlighting events startHighlighting / stopHighlighting / toggleHighlighting
        ;['start', 'stop', 'toggle'].forEach(state => {
            const method = `${state}Highlighting`
            eventBus.$on(method, (id, expand) => { if (id == this.id) this[method](expand) })
        })

        //
        eventBus.$on('expand', (id) => {
            if (id !== this.id) return 
            this.collapse(false)
            const rootId = this.id.replace(/[~\.][~\.0-9]+$/, '')
            if (rootId !== id) eventBus.$emit('expand', rootId)
        })
    },
    computed: {
        id()                 { return this.annotation.id },
        created()            { return this.annotation.created },
        creator()            { return this.annotation.creator },
        modified()           { return this.annotation.modified },
        title()              { return this.annotation.title },
        firstHtmlBody()      { return textualHtmlBody.first(this.annotation) },
        simpleTagBodies()    { return simpleTagBody.all(this.annotation) },
        semanticTagBodies()  { return semanticTagBody.all(this.annotation) },
        relationLinkBodies() { return relationLinkBody.all(this.annotation) },
        svgTarget()          { return svgSelectorResource.first(this.annotation) },
        purl()               { return this.purlTemplate 
                ? this.purlTemplate.replace('{{ slug }}', this.id.replace(/.*\//, ''))
                : this.id },
        slug() {
            if (!this.annotation.id) return 'unsaved-annotation-' + Date.now()
            return this.annotation.id.replace(/[^A-Za-z0-9]/g, '')
        },
        isPurl() {
            return this.annotation.id === this.purlId
        },
    },
    data() {
        return {
            iiifLink: '',
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

        startHighlighting(expand)  {
            this.highlighted = true;
            if (expand) eventBus.$emit('expand', this.id, true)
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
        },
        newestVersionId() {
            if (!this.annotation.hasVersion) return
            return this.annotation.hasVersion[this.annotation.hasVersion.length - 1].id
        },
        isOlderVersion()     {
            if (this.annotation.hasVersion && this.annotation.hasVersion.length <= 1) return false
            if (!this.annotation.id.match(/~/)) return false
            const newestVersionId = this.newestVersionId()
            if (!newestVersionId) return false
            if (this.annotation.id === newestVersionId) return false
            return true
        },
        versionIsShown(version) {
            if (version.id === this.annotation.id) return true
            return this.isOlderVersion()
                ? version.created == this.annotation.created
                : version.created == this.annotation.modified
        },
        _iiifLink() {
            if (! this.svgTarget || this.imageHeight <= 0 || this.imageWidth <= 0 || ! this.iiifUrlTemplate) {
                // console.error("Could not determine width / height of img")
                return ''
            }
            // console.log(this.svgTarget, this.imageHeight,  this.imageWidth, this.iiifUrlTemplate)
            const svg = this.svgTarget.selector.value
            let svgWidth
            svg.replace(/width="(\d+)"/, (_, w) => svgWidth = parseInt(w))

            const drawing = XrxUtils.createDrawing(this.$el.querySelector(".annoeditor-iiif-canvas"), 10000, 10000)
            XrxUtils.drawFromSvg(svg, drawing, {
                absolute: true,
                grouped: false,
            })
            let scale = svgWidth / this.imageWidth
            // console.log({svgWidth, scale, svg, imageWidth: this.imageWidth, imageHeight: this.imageHeight})
            let [[x, y], [x2, y2]] = XrxUtils.boundingBox(drawing)
            let w = (x2 - x)
            let h = (y2 - y)
            ;[x,w] = [x,w].map(_ => _ / this.imageWidth)
            ;[y,h] = [y,h].map(_ => _ / this.imageHeight)
            ;[x,y,w,h] = [x,y,w,h].map(_ => _ / scale * 100)
            return this.$store.state.iiifUrlTemplate.replace(`{{ iiifRegion }}`, `pct:${x},${y},${w},${h}`)
        },
    },
}
