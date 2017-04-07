const {xrx, goog} = require('semtonotes-client')
const XrxUtils = require('../xrx-utils')
const jQuery = require('jquery')
const eventBus = require('../event-bus')

module.exports = {

    mixins: [require('../mixin/l10n')],

    template: require('./zone-editor.html'),

    props: {
        targetImage: {type: String, required: true},
        targetThumbnail: {type: String},
        canvasHeight: {type: Number, default: 400},
        canvasWidth: {type: Number, default: 300},
        thumbHeight: {type: Number, default: 120},
        thumbWidth: {type: Number, default: 120},
        style: {type: Object, default: () => {return defaultStyles}},
    },

    mounted() {

        eventBus.$on('open-editor', () => {
            this.initCanvas(() => {
                this.initThumb(() => {
                    this.fromSVG()
                    // this.image.draw()
                    this.updateNavigationThumb()
                    this.showNavigationThumbnail()
                })
            })
        })


        // Keep only one button active
        jQuery(this.$el).on('click', '.btn-group button', function() {
            this.classList.add('active');
            jQuery(this).siblings().removeClass('active');
        });

    },

    methods: {

        initCanvas(cb) {
            this.canvasDiv = this.$el.querySelector('div.zone-edit-canvas')
            this.image = XrxUtils.createDrawing(this.canvasDiv, this.canvasWidth, this.canvasHeight)

            this.image.setBackgroundImage(this.targetImage, () => {
                // console.log(this.image.getLayerBackground())
                this.image.setModeHover()
                this.image.getViewbox().fitToWidth(false)
                this.image.getViewbox().setZoomFactorMax(4)

                // Bind to SemToNotes events
                this.image.eventViewboxChange = () => {
                    this.updateNavigationThumb()
                }
                this.image.eventShapeModify = (shape) => {
                    this.toSVG()
                    XrxUtils.applyStyle(shape, this.style.modified)
                }
                // this.image.eventShpeHoverIn = (shape) => {
                //     XrxUtils.applyStyle(shape, this.style.hover)
                // }
                // this.image.eventShapeHoverIn = (shape) => {
                //     XrxUtils.applyStyle(shape, this.style.default)
                // }
                // this.image.handleResize()

                cb()
            })
        },

        initThumb(cb) {
            this.thumbDiv = this.$el.querySelector('div.zone-edit-thumb')
            this.thumb = XrxUtils.createDrawing(this.thumbDiv, this.thumbWidth, this.thumbHeight)

            this.thumb.setBackgroundImage(this.targetThumbnail, () => {
                // XXX why won't it fit initially
                // this.thumb.setModeDisabled()
                this.image.getViewbox().fitToWidth(true)
                this.thumb.getViewbox().fit(true)
                this.thumb.getViewbox().setPosition(xrx.drawing.Position.NW)
                // this.thumb.handleResize()

                cb()
            })

        },

        fromSVG(...args) {
            this.image.getLayerShape().removeShapes()
            if (this.$store.getters.svgTarget) {
                const shapes = XrxUtils.drawFromSvg(this.$store.getters.svgTarget.selector.value, this.image)
                shapes.forEach(shape => XrxUtils.applyStyle(shape, this.style.default))
            }
        },

        toSVG(...args) {
            const shapes = this.image.getLayerShape().getShapes()
            if (!shapes || shapes.length === 0) {
                this.$store.dispatch('removeTarget', this.$store.getters.svgTarget)
            } else {
                const svg = XrxUtils.svgFromShapes(shapes)
                // console.log("targetImage", this.targetImage)
                // console.log("New SVG", svg)
                this.$store.dispatch('setSvgSelector', {svg, source: this.targetImage})
            }
        },

        zoomOut(event) {
            this.image.getViewbox().zoomOut()
        },

        zoomIn(event) {
            this.image.getViewbox().zoomIn()
        },

        fitToCanvas(event) {
            this.image.getViewbox().setPosition(xrx.drawing.Position.NW)
            this.image.getViewbox().fit(true)
        },

        rotateLeft(event) {
            this.image.getViewbox().rotateLeft()
            this.thumb.getViewbox().rotateLeft()
        },

        rotateRight(event) {
            this.image.getViewbox().rotateRight()
            this.thumb.getViewbox().rotateRight()
        },

        setModeView(event) {
            this.image.setModeHover()
        },

        moveZone(event) {
            this.image.setModeModify()
        },

        _addPath(pathType) {
            var shape = new xrx.shape[pathType](this.image)
            XrxUtils.applyStyle(shape, this.style.modified)
            // XrxUtils.styleShapeEditable(shape)
            // this.image.getLayerShape().addShapes(shape);
            this.image.setModeCreate(shape.getCreatable())
        },

        addPolygon(event) {
            this._addPath('Polygon')
        },

        addRectangle(event) {
            this._addPath('Rect')
        },

        deleteZone(event) {
            if (typeof(this.image.getSelectedShape()) == 'undefined') {
                window.alert("Please select a shape")
                return
            }
            if (window.confirm("Delete selected shape?")) {
                this.image.removeShape(this.image.getSelectedShape())
                this.toSVG()
            }
        },

        updateNavigationThumb() {
            XrxUtils.navigationThumb(this.thumb, this.image)
        },

        showNavigationThumbnail() {
            this.thumbDiv.style.display = 'inherit';
        },

        hideNavigationThumbnail() {
            this.thumbDiv.style.display = 'none';
        },
    }

}


const defaultStyles = {
    default: {
        strokeWidth: 1,
        strokeColor: '#3B3BFF',
        fillColor: '#3B3BFF',
        fillOpacity: 0.4,
        creatable: {
            strokeWidth: 1,
            strokeColor: '#3B3BFF',
            fillColor: '#3B3BFF',
            fillOpacity: 0.4,
        },
        selectable: {
            strokeColor: '#ff00ff',
            fillColor: '#ff00ff',
        },
    },
    // hover: {
    //     fillOpacity: 1,
    // },
    modified: {
        strokeColor: '#ff0000',
        fillColor: '#ffff00',
        fillOpacity: 0.4,
        creatable: {
            strokeColor: '#ff0000',
            fillColor: '#ffff00',
        }
    }
}
