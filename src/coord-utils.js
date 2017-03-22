const {xrx, goog} = require('semtonotes-client')
const CoordUtils = module.exports =  {};

CoordUtils.drawFromSvg = function drawFromSvg(svgString, drawing, style) {
    if (window === undefined) throw new Error("drawFromSvg must be run in a browser")
    var parser = new window.DOMParser();
    var svg = parser.parseFromString(svgString, "image/svg+xml");
    const shapes = []
    for (let svgRect of svg.querySelectorAll("rect")) {
        var xrxRect = new xrx.shape.Rect(drawing);
        xrxRect.setCoords([
            [svgRect.x,svgRect.y],
            [svgRect.x + svgRect.width, svgRect.y],
            [svgRect.x + svgRect.width, svgRect.y + svg.width],
            [svgRect.x, svgRect.y + svg.width],
        ])
        shapes.push(xrxRect)
    }
    for (let svgPolygon of svg.querySelectorAll("polygon")) {
        var xrxPolygon = new xrx.shape.Polygon(drawing);
        xrxPolygon.setCoords(Array.from(svgPolygon.points).map(point => [point.x, point.y]))
        shapes.push(xrxPolygon)
    }
    if (style) shapes.forEach(shape => {
        shape.setStyle(style)
        shape.getCreatable().setStyle(style)
    })
    drawing.getLayerShape().addShapes(shapes)
    drawing.draw()
}

CoordUtils.svgFromDrawing = function svgFromDrawing(drawing) {
    const svg = ['<?xml version="1.0" encoding="UTF-8" ?>']
    svg.push(`<svg xmlns="http://www.w3.org/2000/svg" version="1.1"
    width="${drawing.getLayerBackground().getImage().getWidth()}"
    height="${drawing.getLayerBackground().getImage().getHeight()}">`)
    for (let shape of drawing.getLayerShape().getShapes()) {
        const coords = shape.getCoords()
        if (CoordUtils.isRectangle(coords)) {
            var [minX, minY] = [Number.MAX_VALUE, Number.MAX_VALUE]
            var [maxX, maxY] = [Number.MIN_VALUE, Number.MIN_VALUE]
            for (let [x, y] of coords) {
                ;[maxX, maxY] = [Math.max(x, maxX), Math.max(y, maxY)]
                ;[minX, minY] = [Math.min(x, minX), Math.min(y, minY)]
            }
            svg.push(`  <rect x="${minX}" y="${minY}" width="${maxX - minX}" height="${maxY - minY}"/>`)
        } else {
            svg.push(`  <polygon points="${coords.map(xy => xy.join(',')).join(' ')}" />`)
        }
    }
    svg.push("</svg>")
    return svg.join('\n')
}

CoordUtils.angleFromMatrix = function angleFromMatrix(m00, m01) {
  var deg=Math.atan2(m01*-1, m00)*180/Math.PI;
  if(deg<0) { deg+=360; }
  return Math.round(deg);
} 

CoordUtils.coordIIIF = function coordIIIF (polygons,imgwidth,imgheight) {
  var maxx = 0;
  var minx = imgwidth;
  var maxy = 0;
  var miny = imgheight;

  var i;
  var j;

  if (Array.isArray(polygons)) {
    for (i = 0; i < polygons.length; i++) {
      if (Array.isArray(polygons[i])) {
        for (j = 0; j < polygons[i].length; j++) {
          if (polygons[i][j][0] > maxx) {maxx = polygons[i][j][0]}
          if (polygons[i][j][0] < minx) {minx = polygons[i][j][0]}
          if (polygons[i][j][1] > maxy) {maxy = polygons[i][j][1]}
          if (polygons[i][j][1] < miny) {miny = polygons[i][j][1]}
        }
      }
    }
  }
  minx *= imgwidth/1000;
  maxx *= imgwidth/1000;
  miny *= imgwidth/1000;
  maxy *= imgwidth/1000;
  var difx = maxx-minx;
  var dify = maxy-miny;
  return parseInt(minx)+','+parseInt(miny)+','+Math.round(difx)+','+Math.round(dify);
}

CoordUtils.coordAbs2Rel = function coordAbs2Rel (polygon,imgwidth) {
  var i;
  var polygonrel = [];
  if (Array.isArray(polygon) && imgwidth > 0) {
    for (i = 0; i < polygon.length; i++) {
      var p = polygon[i];
      var px = p[0] * 1000 / imgwidth;
      var py = p[1] * 1000 / imgwidth;
      polygonrel.push([px,py]);
    }
  }
  return polygonrel;
}

CoordUtils.coordRel2Abs = function coordRel2Abs (polygon,imgwidth) {
  var i;
  var polygonabs = [];
  if (Array.isArray(polygon) && imgwidth > 0) {
    for (i = 0; i < polygon.length; i++) {
      var p = polygon[i];
      var px = Math.round(p[0] * imgwidth / 1000);
      var py = Math.round(p[1] * imgwidth / 1000);
      polygonabs.push([px,py]);
    }
  }
  return polygonabs;
}

CoordUtils.isRectangle = function isRectangle(c) {
  if (Array.isArray(c)) {
    if (c.length == 4) {
      var xcoords = {};
      var ycoords = {};
      var i;
      var oldx = 0;
      var oldy = 0;
      for (i = 0; i < c.length; i++) {
        if (xcoords[c[i][0]]) {xcoords[c[i][0]]++}
        else {xcoords[c[i][0]]=1}
        if (ycoords[c[i][1]]) {ycoords[c[i][1]]++}
        else {ycoords[c[i][1]]=1}
        if (i > 0) {
          if (c[i][0] != oldx && c[i][1] != oldy) {return false}
        }
        oldx = c[i][0];
        oldy = c[i][1];
      }
      var size = 0, key;
      for (key in xcoords) {
        if (xcoords.hasOwnProperty(key)) {
          size++;
          if (xcoords[key] != 2) {return false}
        }
      }
      if (size != 2) {return false}
      size = 0;
      for (key in ycoords) {
        if (ycoords.hasOwnProperty(key)) {
          size++;
          if (ycoords[key] != 2) {return false}
        }
      }
      if (size != 2) {return false}
      return true;
    }
  }
  return false;
}
