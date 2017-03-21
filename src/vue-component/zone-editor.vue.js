const Vue = require('vue')
const {xrx, goog} = require('semtonotes-client')
const CoordUtils = require('../coord-utils')

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

function ZoneEditorComponent(data) {

    const methods = {
        zoomOut(event) {
            this.drawing.getViewbox().zoomOut()
            this.anno_navigationThumb(this.thumb, this.drawing)
        },
        zoomIn(event) {
            this.drawing.getViewbox().zoomIn()
            this.anno_navigationThumb(this.thumb, this.drawing)
        },
        fitToCanvas(event) {
            this.drawing.getViewbox().fit(true)
            this.drawing.getViewbox().setPosition(xrx.drawing.Orientation.NW)
            this.anno_navigationThumb(this.thumb, this.drawing)
        },
        rotateLeft(event) {
            this.drawing.getViewbox().rotateLeft()
            if (this.thumb) this.thumb.getViewbox().rotateLeft()
            this.anno_navigationThumb(this.thumb, this.drawing)
        },
        rotateRight(event) {
            this.drawing.getViewbox().rotateRight()
            if (this.thumb) this.thumb.getViewbox().rotateRight()
            this.anno_navigationThumb(this.thumb, this.drawing)
        },
        addPolygon(event) {
            var styleCreatable = new xrx.shape.Style()
            styleCreatable.setFillColor(`#3B3BFF`)
            styleCreatable.setFillOpacity(0.1)
            styleCreatable.setStrokeWidth(1)
            styleCreatable.setStrokeColor(`#3B3BFF`)
            var np = new xrx.shape.Polygon(this.drawing)
            np.setStyle(styleCreatable)
            np.getCreatable().setStyle(styleCreatable)
            this.drawing.setModeCreate(np.getCreatable())
            this.drawing.draw()
        },
        addRectangle(event) {
            var styleCreatable = new xrx.shape.Style()
            styleCreatable.setFillColor(`#3B3BFF`)
            styleCreatable.setFillOpacity(0.1)
            styleCreatable.setStrokeWidth(1)
            styleCreatable.setStrokeColor(`#3B3BFF`)
            var nr = new xrx.shape.Rect(this.drawing)
            nr.setStyle(styleCreatable)
            nr.getCreatable().setStyle(styleCreatable)
            this.drawing.setModeCreate(nr.getCreatable())
            this.drawing.draw()
        },
        view(event) {
            this.drawing.setModeView()
        },
        moveZone(event) {
            this.drawing.setModeModify()
        },
        deleteZone(event) {
            if (typeof(this.drawing.getSelectedShape()) == 'undefined') {
                window.alert("Please select a shape")
                return
            }
            if (window.confirm("Delete selected shape?")) {
                this.drawing.removeShape(this.drawing.getSelectedShape())
            }
        },
        but_zone_edit(event) {
            // XXX ???
            $(`a[href="#${this.prefix}_tab_zones"`).tab('show')
        },
        activate(event) {
            this.drawing = new xrx.drawing.Drawing(goog.dom.getElement(this.prefix+'_zoneeditcanvas'))
            this.drawing.draw()
            if (!this.drawing.getEngine().isAvailable()) {
                throw new Error("No Engine available :-( Much sadness")
            }

            // Draw
            this.drawing.draw()

            this.drawing.setBackgroundImage(this.config.edit_img_url, () => {
                this.drawing.setModeView()
                this.drawing.getViewbox().fitToWidth(false)

                // TODO
                var z = $(`#${this.prefix}_field_polygon`).val()
                if (z.length > 0) {
                    var p = z.split('<end>')
                    var i
                    var shapes = []
                    for (i = 0; i < p.length; i++) {
                        if (p[i]) {
                            var coords = CoordUtils.coordRel2Abs(JSON.parse(`[${p[i]}]`), this.config.edit_img_width)
                            var shape
                            if (CoordUtils.isRectangle(coords)) {
                                shape = new xrx.shape.Rect(this.drawing)
                            }
                            else {
                                shape = new xrx.shape.Polygon(this.drawing)
                            }
                            shape.setCoords(coords)
                            shape.setStrokeWidth(1)
                            shape.setStrokeColor(`#A00000`)
                            shape.setFillColor('#A00000')
                            shape.setFillOpacity(0.2)
                            shape.getSelectable().setFillColor('#000000')
                            shape.getSelectable().setFillOpacity(0.2)
                            shape.getSelectable().setStrokeWidth(3)
                            shapes.push(shape)
                        }
                    }
                    this.drawing.getLayerShape().addShapes(shapes)
                }
                this.drawing.draw()
                if (this.config.edit_img_thumb) {
                    $(`#${this.prefix}_thumb`).show()
                    this.thumb = new xrx.drawing.Drawing(goog.dom.getElement(this.prefix+'_thumb'))
                    if (this.thumb.getEngine().isAvailable()) {
                        this.thumb.setBackgroundImage(this.config.edit_img_thumb, () => {
                            this.thumb.setModeDisabled()
                            this.thumb.getViewbox().fit(true)
                            this.thumb.getViewbox().setPosition(xrx.drawing.Orientation.NW)
                            this.thumb.draw()
                            this.anno_navigationThumb(this.thumb, this.drawing)
                        })
                    }
                }
                this.drawing.getViewbox().setZoomFactorMax(4)
            })

            // Bind handlers and such
            this.drawing.eventViewboxChange = (x, y) => {
                this.anno_navigationThumb(this.thumb, this.drawing)
            }

        },

        anno_navigationThumb(thumbdrawing, origdrawing) {
            if (!thumbdrawing)
                return
            // if (typeof(thumbdrawing) == 'undefined') {return}
            // if (typeof(origdrawing) == 'undefined') {return}
            // var status = Cookies.get('navThumb');
            // if (status == '0') {return}

            // $('#'+thumbdrawing.element_.id).fadeIn();
            // $('#'+thumbdrawing.element_.id).next('.thumbEye').eq(0).fadeIn();
            // clearTimeout(thumbTimeout);
            // thumbTimeout = setTimeout(function() {
            //     $('#'+thumbdrawing.element_.id).fadeOut(1000)
            //     $('#'+thumbdrawing.element_.id).next('.thumbEye').eq(0).fadeOut(1000)
            // }, 3000);

            var matrix = origdrawing.getViewbox().ctmDump();
            var trans = new goog.math.AffineTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
            var scaleX = Math.sqrt(Math.pow(trans.getScaleX(), 2)+Math.pow(trans.getShearX(), 2));
            var scaleY = Math.sqrt(Math.pow(trans.getScaleY(), 2)+Math.pow(trans.getShearY(), 2)); /* == scaleX, wenn keine Scherung */
            var thumbWidth = thumbdrawing.getLayerBackground().getImage().getWidth();
            var thumbHeight = thumbdrawing.getLayerBackground().getImage().getHeight();
            var origwidth = origdrawing.getLayerBackground().getImage().getWidth();
            var origheight = origdrawing.getLayerBackground().getImage().getHeight();
            var faktorX = thumbWidth/(origwidth*scaleX);
            var faktorY = thumbHeight/(origheight*scaleY);

            var bildLO = [];
            trans.transform([0, 0], 0, bildLO, 0, 1);

            var ausschnittWidth = origdrawing.getCanvas().getWidth();
            var ausschnittHeight = origdrawing.getCanvas().getHeight();
            var ausschnittRect = new xrx.shape.Rect(thumbdrawing);

            var ausschnittRectP1 = [];
            var ausschnittRectP2 = [];
            var ausschnittRectP3 = [];
            var ausschnittRectP4 = [];
            var angle = CoordUtils.angleFromMatrix(matrix[0], matrix[1]);
            /* Drechung 90 Grad rechts */
            if (angle == 270) {
                ausschnittRectP1 = [(0-bildLO[1])*faktorY, (bildLO[0]-ausschnittWidth)*faktorX];
                ausschnittRectP2 = [(ausschnittHeight-bildLO[1])*faktorY, (bildLO[0]-ausschnittWidth)*faktorX];
                ausschnittRectP3 = [(ausschnittHeight-bildLO[1])*faktorY, bildLO[0]*faktorX];
                ausschnittRectP4 = [(0-bildLO[1])*faktorY, bildLO[0]*faktorX]
            }
            /* Drechung 180 Grad  */
            else if (angle == 180) {
                ausschnittRectP1 = [(bildLO[0]-ausschnittWidth)*faktorX, (bildLO[1]-ausschnittHeight)*faktorY];
                ausschnittRectP2 = [(bildLO[0])*faktorX, (bildLO[1]-ausschnittHeight)*faktorY];
                ausschnittRectP3 = [(bildLO[0])*faktorX, (bildLO[1])*faktorY];
                ausschnittRectP4 = [(bildLO[0]-ausschnittWidth)*faktorX, (bildLO[1])*faktorY];
            }
            /* Drechung 90 Grad links */
            else if (angle == 90) {
                ausschnittRectP1 = [(bildLO[1]-ausschnittHeight)*faktorY, (0-bildLO[0])*faktorX];
                ausschnittRectP2 = [(bildLO[1])*faktorY, (0-bildLO[0])*faktorX];
                ausschnittRectP3 = [(bildLO[1])*faktorY, (ausschnittWidth-bildLO[0])*faktorX];
                ausschnittRectP4 = [(bildLO[1]-ausschnittHeight)*faktorY, (ausschnittWidth-bildLO[0])*faktorX]
            }
            else {
                /* Drehung 0 Grad */
                ausschnittRectP1 = [(0-bildLO[0])*faktorX, (0-bildLO[1])*faktorY];
                ausschnittRectP2 = [(ausschnittWidth-bildLO[0])*faktorX, (0-bildLO[1])*faktorY];
                ausschnittRectP3 = [(ausschnittWidth-bildLO[0])*faktorX, (ausschnittHeight-bildLO[1])*faktorY];
                ausschnittRectP4 = [(0-bildLO[0])*faktorX, (ausschnittHeight-bildLO[1])*faktorY];
            }

            var rect = new xrx.shape.Rect(thumbdrawing);
            rect.setCoords([ausschnittRectP1, ausschnittRectP2, ausschnittRectP3, ausschnittRectP4]);
            rect.setStrokeWidth(1.5);
            var color = '#A00000';
            if (typeof(zonecolor) == 'object' && zonecolor.length > 3) {
                color = '#'+zonecolor[0];
            }
            rect.setStrokeColor(color);
            rect.setFillColor(color);
            rect.setFillOpacity(0.15);
            var rects = [];
            rects.push(rect);
            thumbdrawing.getLayerShape().removeShapes();
            thumbdrawing.getLayerShape().addShapes(rect);
            thumbdrawing.draw();
        }
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
    return Vue.component('zone-editor', {
        template: require('./zone-editor.vue.html'),
        data: () => data,
        methods

    })
}
