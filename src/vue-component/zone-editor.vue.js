const Vue = require('vue')
const {xrx, goog} = require('semtonotes-client')
const CoordUtils = require('../coord-utils')
const XrxUtils = require('../xrx-utils')
const jQuery = require('jquery')

try {
    window.ZoneEditorComponent = ZoneEditorComponent
    window.Vue = Vue
} catch (e) {
    console.error("Not in a browser context")
}
module.exports = ZoneEditorComponent


function ZoneEditorComponent(data) {

    Vue.component('zone-editor-button', {
        props: ['on-click', 'glyphicon', 'title', 'font-awesome', 'src', 'alt'],
        template: require('./zone-editor-button.vue.html'),
        methods: {
            clickHandler(event) {
                this.$parent[this.onClick](event)
            },

        }
    })


    return Vue.component('zone-editor', {
        template: require('./zone-editor.vue.html'),
        data: () => data,
        created() {
            this.canvasWidth  = this.canvasWidth  || 600
            this.canvasHeight = this.canvasHeight || 300
            if (!this.targetImage) throw new Error("Must pass 'targetImage' option")
        },
        mounted() {
            this.image = new xrx.drawing.Drawing(goog.dom.getElement('ubhdannoprefix_zoneeditcanvas'))
            if (!this.image.getEngine().isAvailable()) throw new Error("No Engine available :-( Much sadness")
            ;['targetImage', 'targetThumbnail'].forEach(k => {
                if (this[k] && typeof this[k] === 'string') this[k] = {id: this[k]}
            })
            if (!this.targetThumbnail) this.targetThumbnail = this.targetImage;
            this.thumb = new xrx.drawing.Drawing(goog.dom.getElement('ubhdannoprefix_zoneeditthumb'))
            if (!this.thumb.getEngine().isAvailable()) throw new Error("No Engine available :-( Much sadness")

            jQuery(this.$el).on('click', '.btn-group button', function() {
                this.classList.add('active');
                jQuery(this).siblings().removeClass('active');
            });

            this.image.setBackgroundImage(this.targetImage.id, () => {
                this.image.getViewbox().fitToWidth(false)
                // Draw all svg targets
                this.fromSVG()
                this.image.getViewbox().setZoomFactorMax(4)
                this.image.setModeView()
                this.image.draw()


                if (this.thumb) {
                    // Bind to SemToNotes events
                    this.image.eventViewboxChange = () => {
                        this.updateNavigationThumb()
                    }
                    this.image.eventShapeModify = () => {
                        this.toSVG()
                    }
                    this.thumb.setBackgroundImage(this.targetThumbnail.id, () => {
                        this.thumb.setModeDisabled()
                        this.thumb.getViewbox().fit(true)
                        this.thumb.getViewbox().setPosition(xrx.drawing.Orientation.NW)
                        this.showNavigationThumbnail()
                        this.updateNavigationThumb()
                    })
                }
            })

        },

        methods: {

            getSvgSelector() {
                return this.annotation.target
                    .find(t => t.selector && t.selector.type === 'SvgSelector')
                    .selector
            },

            fromSVG(...args) {
                this.image.getLayerShape().removeShapes()
                const shapes = XrxUtils.drawFromSvg(this.getSvgSelector().value, this.image)
                shapes.forEach(shape => XrxUtils.styleShapeEditable(shape))
            },

            toSVG(...args) {
                const svg = XrxUtils.svgFromShapes(this.image.getLayerShape().getShapes())
                // console.log("New SVG", svg)
                this.getSvgSelector().value = svg
            },


            zoomOut(event) {
                this.image.getViewbox().zoomOut()
            },

            zoomIn(event) {
                this.image.getViewbox().zoomIn()
            },

            fitToCanvas(event) {
                this.image.getViewbox().fit(true)
                this.image.getViewbox().setPosition(xrx.drawing.Orientation.NW)
            },

            rotateLeft(event) {
                this.image.getViewbox().rotateLeft()
                if (this.thumb) this.thumb.getViewbox().rotateLeft()
            },

            rotateRight(event) {
                this.image.getViewbox().rotateRight()
                if (this.thumb) this.thumb.getViewbox().rotateRight()
            },

            setModeView(event) {
                this.image.setModeView()
            },

            moveZone(event) {
                this.image.setModeModify()
            },

            _addPath(pathType) {
                var shape = new xrx.shape[pathType](this.image)
                XrxUtils.styleShapeEditable(shape)
                // this.image.getLayerShape().addShapes(shape);
                this.image.setModeCreate(shape.getCreatable())
            },

            addPolygon(event) { this._addPath('Polygon') },
            addRectangle(event) { this._addPath('Rect') },

            deleteZone(event) {
                if (typeof(this.image.getSelectedShape()) == 'undefined') {
                    window.alert("Please select a shape")
                    return
                }
                if (window.confirm("Delete selected shape?")) {
                    this.image.removeShape(this.image.getSelectedShape())
                }
            },

            updateNavigationThumb() { XrxUtils.navigationThumb(this.thumb, this.image) },
            showNavigationThumbnail() { document.querySelector('#ubhdannoprefix_zoneeditthumb').style.display = 'inherit'; },
            hideNavigationThumbnail() { document.querySelector('#ubhdannoprefix_zoneeditthumb').style.display = 'none'; },
        }

    })

}
