const {xrx, goog} = require('semtonotes-client')
const XrxUtils = require('../xrx-utils')
const jQuery = require('jquery')

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

function createSvgTarget(ctx) {
    return {
        source: ctx.targetImage,
        selector: {
            type: 'SvgSelector',
            value: '',
        }
    }
}

module.exports = {

    template: require('./zone-editor.html'),

    components: {
        'bootstrap-button': require('./bootstrap-button')
    },

    props: {
        annotation: {type: Object, required: true},
        targetImage: {type: String, required: true},
        l10n: {type: Object, required: true},
        targetThumbnail: {type: String},
        canvasHeight: {type: Number, default: 640},
        canvasWidth: {type: Number, default: 480},
        thumbHeight: {type: Number, default: 120},
        thumbWidth: {type: Number, default: 120},
        style: {type: Object, default: () => {return defaultStyles}},
    },

    created() {
        if (!this.targetImage) throw new Error("Must set 'targetImage'")
        if (!this.targetThumbnail) this.targetThumbnail = this.targetImage;
    },

    mounted() {
        console.log(this.annotation)
        const canvasDiv = this.$el.querySelector('#ubhdannoprefix_zoneeditcanvas')
        this.image = XrxUtils.createDrawing(canvasDiv, this.canvasWidth, this.canvasHeight)

        const thumbDiv = this.$el.querySelector('#ubhdannoprefix_zoneeditthumb')
        this.thumb = XrxUtils.createDrawing(thumbDiv, this.thumbWidth, this.thumbHeight)

        // Keep only one button active
        jQuery(this.$el).on('click', '.btn-group button', function() {
            this.classList.add('active');
            jQuery(this).siblings().removeClass('active');
        });

        this.thumb.setBackgroundImage(this.targetThumbnail, () => {
            // XXX why won't it fit initially
            this.thumb.setModeDisabled()
            // this.thumb.handleResize()
            this.thumb.getViewbox().setPosition(xrx.drawing.Position.NW)
            this.thumb.getViewbox().fit(true)
            this.showNavigationThumbnail()
        })

        this.image.setBackgroundImage(this.targetImage, () => {
            // console.log(this.image.getLayerBackground())
            this.image.setModeHover()
            this.image.getViewbox().fitToWidth(false)
            this.thumb.getViewbox().setPosition(xrx.drawing.Position.NW)
            this.image.getViewbox().setZoomFactorMax(4)

            // Draw all svg targets
            this.fromSVG()
            this.image.draw()

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
            this.updateNavigationThumb()
        })

    },

    methods: {

        getSvgTarget() {
            if (!this.annotation.target) this.annotation.target = []
            if (!Array.isArray(this.annotation.target)) {
                this.annotation.target = [this.annotation.target]
            }
            var svgTarget = this.annotation.target
                .find(t => t.selector && t.selector.type === 'SvgSelector')
            if (!svgTarget) {
                svgTarget = createSvgTarget(this)
                this.annotation.target.push(svgTarget)
            }
            if (!svgTarget.source) svgTarget.source = this.targetImage
            return svgTarget
        },

        fromSVG(...args) {
            this.image.getLayerShape().removeShapes()
            const shapes = XrxUtils.drawFromSvg(this.getSvgTarget().selector.value, this.image)
            shapes.forEach(shape => XrxUtils.applyStyle(shape, this.style.default))
        },

        toSVG(...args) {
            const svg = XrxUtils.svgFromShapes(this.image.getLayerShape().getShapes())
            console.log("New SVG", svg)
            this.getSvgTarget().selector.value = svg
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
            }
        },

        updateNavigationThumb() {
            XrxUtils.navigationThumb(this.thumb, this.image)
        },

        showNavigationThumbnail() {
            document.querySelector('#ubhdannoprefix_zoneeditthumb').style.display = 'inherit';
        },

        hideNavigationThumbnail() {
            document.querySelector('#ubhdannoprefix_zoneeditthumb').style.display = 'none';
        },
    }

}
