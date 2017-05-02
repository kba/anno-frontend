const XrxUtils = require('semtonotes-utils')
const jQuery = require('jquery')
const eventBus = require('../event-bus')

/**
 * ### zone-editor
 *
 * Editor for creating zones as SVG on the `targetImage`.
 *
 * #### Props:
 *
 * - `autoLoad`: Whether the SemToNotes canvas should be initialized
 *   immediately after mounting. Defaults to false, since the image can change
 * - **`targetImage`**: Image to annotate
 * - `targetThumbnail`: Smaller version of the image for navigation, defaults
 *   to `targetImage`
 * - `canvasHeight`: Height of the canvas. Default: `400`.
 * - `canvasWidth`: Width of the canvas. Default: `300`.
 * - `thumbHeight`: Height of the navigation thumbnail. Default: `120`.
 * - `thumbWidth`: Width of the navigation thumbnail. Default: `120`.
 * - `style`: Style to apply to shapes. See semtonotes-utils#applyStyle TODO
 *
 * #### Methods
 *
 * - `init(cb)`: Initialize the canvasses
 *
 */

module.exports = {

    mixins: [
        require('../mixin/l10n'),
        require('../mixin/prefix'),
    ],
    template: require('./zone-editor.html'),
    style:    require('./zone-editor.css'),
    props: {
        targetImage: {type: String, required: true},
        targetThumbnail: {type: String},
        canvasHeight: {type: Number, default: 400},
        canvasWidth: {type: Number, default: 300},
        thumbHeight: {type: Number, default: 120},
        thumbWidth: {type: Number, default: 120},
        style: {type: Object, default: () => {return defaultStyles}},
        autoLoad: {type: Boolean, default: false},
    },

    mounted() {

        if (this.autoLoad) this.init()

        eventBus.$on('open-editor', () => {
            this.init()
        })


        // Keep only one button active
        jQuery(this.$el).on('click', '.btn-group button', function() {
            this.classList.add('active');
            jQuery(this).siblings().removeClass('active');
        });

    },

    methods: {

        init() {
            this.initCanvas(() => {
                this.initThumb(() => {
                    this.fromSVG()
                    // this.image.draw()
                    this.updateNavigationThumb()
                    this.showNavigationThumbnail()
                })
            })
        },

        initCanvas(cb) {
            this.canvasDiv = this.$el.querySelector(`div.${this.prefix}-zone-editor-canvas`)
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
            this.thumbDiv = this.$el.querySelector(`div.${this.prefix}-zone-editor-thumb`)
            this.thumbDiv.style.display = 'block'
            this.thumb = XrxUtils.createDrawing(this.thumbDiv, this.thumbWidth, this.thumbHeight)

            this.thumb.setBackgroundImage(this.targetThumbnail, () => {
                // XXX why won't it fit initially
                // this.thumb.setModeDisabled()
                this.image.getViewbox().fitToWidth(true)
                this.thumb.getViewbox().fit(true)
                this.thumb.getViewbox().setPosition('NW')
                // this.thumb.handleResize()

                cb()
            })

        },

        fromSVG(...args) {
            this.image.getLayerShape().removeShapes()
            if (this.$store.getters.svgTarget) {
                const shapeGroup = XrxUtils.shapesFromSvg(this.$store.getters.svgTarget.selector.value, this.image)
                XrxUtils.applyStyle(shapeGroup, this.style.default)
                this.image.getLayerShape().addShapes(shapeGroup.getChildren())
            }
        },

        toSVG(...args) {
            const shapes = this.image.getLayerShape().getShapes()
            if (!shapes || shapes.length === 0) {
                this.$store.commit('REMOVE_TARGET', this.$store.getters.svgTarget)
            } else {
                const svg = XrxUtils.svgFromShapes(shapes)
                // console.log("targetImage", this.targetImage)
                // console.log("New SVG", svg)
                this.$store.commit('SET_SVG_SELECTOR', {svg, source: this.targetImage})
            }
        },

        zoomOut(event) {
            this.image.getViewbox().zoomOut()
        },

        zoomIn(event) {
            this.image.getViewbox().zoomIn()
        },

        fitToCanvas(event) {
            this.image.getViewbox().setPosition('NW')
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
            var shape = XrxUtils.createShape(pathType, this.image)
            XrxUtils.applyStyle(shape, this.style.modified)
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
