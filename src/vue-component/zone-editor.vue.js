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

    var styleCreatable = new xrx.shape.Style()
    styleCreatable.setFillColor(`#3B3BFF`)
    styleCreatable.setFillOpacity(0.1)
    styleCreatable.setStrokeWidth(1)
    styleCreatable.setStrokeColor(`#3B3BFF`)

    const methods = {

        styleShapeHighlight(shape) {
            shape.setStrokeWidth(1)
            shape.setStrokeColor(`#A00000`)
            shape.setFillColor('#A00000')
            shape.setFillOpacity(0.2)
            shape.getSelectable().setFillColor('#000000')
            shape.getSelectable().setFillOpacity(0.2)
            shape.getSelectable().setStrokeWidth(3)
        },

        zoomOut(event) {
            this.image.getViewbox().zoomOut()
            this.anno_navigationThumb(this.thumb, this.image)
        },

        zoomIn(event) {
            this.image.getViewbox().zoomIn()
            this.anno_navigationThumb(this.thumb, this.image)
        },

        fitToCanvas(event) {
            this.image.getViewbox().fit(true)
            this.image.getViewbox().setPosition(xrx.drawing.Orientation.NW)
            this.anno_navigationThumb(this.thumb, this.image)
        },

        rotateLeft(event) {
            this.image.getViewbox().rotateLeft()
            if (this.thumb) this.thumb.getViewbox().rotateLeft()
            this.anno_navigationThumb(this.thumb, this.image)
        },

        rotateRight(event) {
            this.image.getViewbox().rotateRight()
            if (this.thumb) this.thumb.getViewbox().rotateRight()
            this.anno_navigationThumb(this.thumb, this.image)
        },

        setModeView(event) {
            this.image.setModeView()
        },

        moveZone(event) {
            this.image.setModeModify()
        },

        addPolygon(event) {
            var np = new xrx.shape.Polygon(this.image)
            np.setStyle(styleCreatable)
            np.getCreatable().setStyle(styleCreatable)
            this.image.setModeCreate(np.getCreatable())
            this.image.draw()
        },

        addRectangle(event) {
            var nr = new xrx.shape.Rect(this.image)
            nr.setStyle(styleCreatable)
            nr.getCreatable().setStyle(styleCreatable)
            this.image.setModeCreate(nr.getCreatable())
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

        activate(event) {

            this.image = new xrx.drawing.Drawing(goog.dom.getElement('ubhdannoprefix_zoneeditcanvas'))
            if (!this.image.getEngine().isAvailable()) {
                throw new Error("No Engine available :-( Much sadness")
            }

            // Draw
            this.image.draw()

            this.image.setModeView()

            this.image.setBackgroundImage(this.target.edit_img_url, () => {
                this.image.getViewbox().fitToWidth(false)

                // TODO bind change handler to save svg
                var z = [];//$(`#ubhdannoprefix_field_polygon`).val()
                if (z.length > 0) {
                    var p = z.split('<end>')
                    var i
                    var shapes = []
                    for (i = 0; i < p.length; i++) {
                        if (p[i]) {
                            var coords = CoordUtils.coordRel2Abs(JSON.parse(`[${p[i]}]`), this.config.edit_img_width)
                            var shape
                            if (CoordUtils.isRectangle(coords)) {
                                shape = new xrx.shape.Rect(this.image)
                            }
                            else {
                                shape = new xrx.shape.Polygon(this.image)
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
                    this.image.getLayerShape().addShapes(shapes)
                }
                this.image.draw()
                if (this.config.edit_img_thumb) {
                    // $(`#ubhdannoprefix_thumb`).show()
                    this.thumb = new xrx.drawing.Drawing(goog.dom.getElement('ubhdannoprefix_thumb'))
                    if (this.thumb.getEngine().isAvailable()) {
                        this.thumb.setBackgroundImage(this.config.edit_img_thumb, () => {
                            this.thumb.setModeDisabled()
                            this.thumb.getViewbox().fit(true)
                            this.thumb.getViewbox().setPosition(xrx.drawing.Orientation.NW)
                            this.thumb.draw()
                            this.anno_navigationThumb(this.thumb, this.image)
                        })
                    }
                }
                this.image.getViewbox().setZoomFactorMax(4)
            })

            // Bind handlers and such
            this.image.eventViewboxChange = this.onViewboxChange.bind(this)

        },

        fromSVG(...args) {
            // TODO from anno
            const svgString = `<?xml version="1.0" encoding="UTF-8" ?>
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1024" height="1024">
  <rect x="450.56" y="34.13333333333333" width="274.77333333333337" height="211.6266666666667"/>
  <polygon points="232.10666666666668,114.34666666666668 78.50666666666667,349.8666666666667 373.76000000000005,424.96000000000004 344.74666666666667,211.6266666666667" />
</svg>
`
            CoordUtils.drawFromSvg(svgString, this.image, styleCreatable)
        },

        toSVG(...args) {
            const svg = CoordUtils.svgFromDrawing(this.image)
            console.log(svg)
            // <s
            // console.log(svg)
            // const svgElem = goog.dom.createElement('svg')
            // svgElem.height = this.image.getHeight()
            // svgElem.hidth = this.image.getWidth()
            // var svgDrawing = new xrx.drawing.Drawing(svgElem, xrx.engine.SVG)
            // svgDrawing.setHeight(this.image.getHeight())
            // svgDrawing.setWidth(this.image.getWidth())
            // svgDrawing.draw()
            // console.log(svgDrawing)
            // console.log(svgDrawing.draw())
            // svgdrawing.addShapes(shapes)
            // // console.log(shapes)
            // // console.log(svgdrawing)
            // console.log(svgElem)
        },

        onViewboxChange(...args) {
            // console.log(this.image.getLayerShape().getShapes())
        //                 var shapes = zoneeditdrawing.
        //                 var new_svg_polygon = '';
        //                 for (var i = 0; i < shapes.length; i++) {
        //                     var c = ''
        //                     var polygonnew = CoordUtils.coordAbs2Rel(shapes[i].getCoords(), options.edit_img_width);
        //                     for (var j = 0; j < polygonnew.length; j++) {
        //                         if (j > 0) {c += ', '}
        //                         c += JSON.stringify(polygonnew[j]);
        //                     }
        //                     if (c) {new_svg_polygon += c + '<end>';}
        //                 }
            this.anno_navigationThumb(this.thumb, this.image)
        },


        anno_navigationThumb(thumb, origdrawing) {
            if (!thumb)
                return
            // if (typeof(thumb) == 'undefined') {return}
            // if (typeof(origdrawing) == 'undefined') {return}
            // var status = Cookies.get('navThumb');
            // if (status == '0') {return}

            // $('#'+thumb.element_.id).fadeIn();
            // $('#'+thumb.element_.id).next('.thumbEye').eq(0).fadeIn();
            // clearTimeout(thumbTimeout);
            // thumbTimeout = setTimeout(function() {
            //     $('#'+thumb.element_.id).fadeOut(1000)
            //     $('#'+thumb.element_.id).next('.thumbEye').eq(0).fadeOut(1000)
            // }, 3000);


            var matrix = origdrawing.getViewbox().ctmDump();
            var trans = new goog.math.AffineTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
            var scaleX = Math.sqrt(Math.pow(trans.getScaleX(), 2)+Math.pow(trans.getShearX(), 2));
            var scaleY = Math.sqrt(Math.pow(trans.getScaleY(), 2)+Math.pow(trans.getShearY(), 2)); /* == scaleX, wenn keine Scherung */
            var thumbWidth = thumb.getLayerBackground().getImage().getWidth();
            var thumbHeight = thumb.getLayerBackground().getImage().getHeight();
            var origwidth = origdrawing.getLayerBackground().getImage().getWidth();
            var origheight = origdrawing.getLayerBackground().getImage().getHeight();
            var faktorX = thumbWidth/(origwidth*scaleX);
            var faktorY = thumbHeight/(origheight*scaleY);

            var bildLO = [];
            trans.transform([0, 0], 0, bildLO, 0, 1);

            var ausschnittWidth = origdrawing.getCanvas().getWidth();
            var ausschnittHeight = origdrawing.getCanvas().getHeight();
            var ausschnittRect = new xrx.shape.Rect(thumb);

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

            var rect = new xrx.shape.Rect(thumb);
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
            thumb.getLayerShape().removeShapes();
            thumb.getLayerShape().addShapes(rect);
            thumb.draw();
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


    data.canvasWidth = 600
    data.canvasHeight = 300
    return Vue.component('zone-editor', {
        template: require('./zone-editor.vue.html'),
        data: () => data,
        methods

    })

}
