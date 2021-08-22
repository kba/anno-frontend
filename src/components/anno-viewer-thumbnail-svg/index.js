module.exports = {
  template: require('./thumb.html'),
  props: {
    svgTarget:    { type: [Object] },
    sizePx:       { type: [Number], default: 36 },
    widthPx:      { type: [Number, undefined] },
    heightPx:     { type: [Number, undefined] },

    thumbStrokeColor:   { type: [String, undefined] },
    thumbFillColor:     { type: [String, undefined] },
  },
}
