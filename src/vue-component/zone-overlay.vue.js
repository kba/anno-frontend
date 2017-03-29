const Vue = require('vue')
const {xrx, goog} = require('semtonotes-client')
const XrxUtils = require('../xrx-utils')

module.exports = ZoneOverlayComponent

function ZoneOverlayComponent(canvas, data) {
    // data.image = new xrx.drawing.Drawing(goog.dom.getElement(id))
    return Vue.component('zone-editor', {
        el: canvas,
        data: () => {return {data}},
        methods: {
            drawZones() {
                this.data.annos
                    .find(anno => anno.target.selector && anno.target.selector.type && anno.target.selector.type === 'SvgSelector')
                    .map(anno => anno.target.selector.value)
                    .forEach(svg => {
                        XrxUtils.drawFromSvg(svg, this.$el)
                    })
            }
        }
    })
}
