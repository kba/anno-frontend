const Vue = require('vue')
const {xrx, goog} = require('semtonotes-client')
const CoordUtils = require('../coord-utils')
const XrxUtils = require('../xrx-utils')
const jQuery = require('jquery')

// require('../../img/polygon.png')
// require('../../img/rect.png')

try {
    window.ZoneEditorComponent = ZoneEditorComponent
    window.Vue = Vue
} catch (e) {
    console.error("Not in a browser context")
}
module.exports = ZoneEditorComponent


// TODO drawing
// const drawing = null;
// const thumb = null
// const anno_navigationThumb = null;
//

function ZoneEditorComponent(data) {

    const methods = {

        activate(event) {

            this.image = new xrx.drawing.Drawing(goog.dom.getElement('ubhdannoprefix_zoneeditcanvas'))
            if (!this.image.getEngine().isAvailable()) throw new Error("No Engine available :-( Much sadness")
            if (!this.targetImage) throw new Error("Must pass 'targetImage' option")
            ;['targetImage', 'targetThumbnail'].forEach(k => {
                if (this[k] && typeof this[k] === 'string') this[k] = {id: this[k]}
            })
            if (this.targetThumbnail) { 
                this.thumb = new xrx.drawing.Drawing(goog.dom.getElement('ubhdannoprefix_zoneeditthumb'))
                if (!this.thumb.getEngine().isAvailable()) throw new Error("No Engine available :-( Much sadness")
            }

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

        fromSVG(...args) {
            this.image.getLayerShape().removeShapes()
            this.annotation.target
                .filter(target => target.selector && target.selector.type === 'SvgSelector')
                .forEach((target) => {
                    const shapes = XrxUtils.drawFromSvg(target.selector.value, this.image)
                    shapes.forEach(shape => {
                        // retain a connection from shape to the target it represents
                        shape.representsTarget = target
                        XrxUtils.styleShapeHighlighted(shape)
                    })
                })
        },

        toSVG(...args) {
            const groupByTarget = new Map()
            this.image.getLayerShape().getShapes().forEach(shape => {
                if (!groupByTarget.has(shape.representsTarget)) {
                    groupByTarget.set(shape.representsTarget, [])
                }
                groupByTarget.get(shape.representsTarget).push(shape)
            })
            groupByTarget.forEach((shapes, target) => {
                const svg = XrxUtils.svgFromShapes(shapes)
                console.log("New SVG for", target, svg)
                target.selector.value = svg
            })
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

        addPolygon(event) {
            var newPolygon = new xrx.shape.Polygon(this.image)
            XrxUtils.styleShapeEditable(newPolygon)
            this.image.setModeCreate(newPolygon.getCreatable())
            this.image.draw()
        },

        addRectangle(event) {
            var newRectangle = new xrx.shape.Rect(this.image)
            XrxUtils.styleShapeEditable(newRectangle)
            this.image.setModeCreate(newRectangle.getCreatable())
            this.image.draw()
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

        updateNavigationThumb() { XrxUtils.navigationThumb(this.thumb, this.image) },
        showNavigationThumbnail() { document.querySelector('#ubhdannoprefix_zoneeditthumb').style.display = 'inherit'; },
        hideNavigationThumbnail() { document.querySelector('#ubhdannoprefix_zoneeditthumb').style.display = 'none'; },
    }


    Vue.component('zone-editor-button', {
        props: ['on-click', 'glyphicon', 'title', 'font-awesome', 'src', 'alt'],
        template: require('./zone-editor-button.vue.html'),
        methods: {
            clickHandler(event) {
                this.$parent[this.onClick](event)
            },

        }
    })


    data.canvasWidth = 600
    data.canvasHeight = 300
    return Vue.component('zone-editor', {
        template: require('./zone-editor.vue.html'),
        data: () => data,
        methods
    })

}
