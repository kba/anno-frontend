const {xrx} = require('semtonotes-client')
const XrxUtils = require('../xrx-utils')
const jQuery = require('jquery')

module.exports = {

    template: require('./zone-editor.vue.html'),

    components: {
        'zone-editor-button': require('./zone-editor-button.vue')
    },

    props: {
        annotation: {type: Object, required: true},
        targetImage: {type: String, required: true},
        targetThumbnail: {type: String},
        l10n: {type: Object},
        canvasHeight: {type: Number, default: 640},
        canvasWidth: {type: Number, default: 480},
    },

    created() {
        if (!this.targetImage) throw new Error("Must set 'targetImage'")
    },

    mounted() {
        console.log(this.annotation)
        this.image = new xrx.drawing.Drawing(this.$el.querySelector('#ubhdannoprefix_zoneeditcanvas'))
        if (!this.image.getEngine().isAvailable()) throw new Error("No Engine available :-( Much sadness")
        if (!this.targetThumbnail) this.targetThumbnail = this.targetImage;
        this.thumb = new xrx.drawing.Drawing(this.$el.querySelector('#ubhdannoprefix_zoneeditthumb'))
        if (!this.thumb.getEngine().isAvailable()) throw new Error("No Engine available :-( Much sadness")

        jQuery(this.$el).on('click', '.btn-group button', function() {
            this.classList.add('active');
            jQuery(this).siblings().removeClass('active');
        });

        this.image.setBackgroundImage(this.targetImage, () => {
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
                this.thumb.setBackgroundImage(this.targetThumbnail, () => {
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

}
