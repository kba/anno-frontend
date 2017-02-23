var CoordUtils = module.exports =  {};

CoordUtils.coordIIIF = function anno_coordIIIF (polygons,imgwidth,imgheight) {
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

CoordUtils.coordAbs2Rel = function anno_coordAbs2Rel (polygon,imgwidth) {
  var i;
  var polygonrel = new Array();
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

CoordUtils.coordRel2Abs = function anno_coordRel2Abs (polygon,imgwidth) {
  var i;
  var polygonabs = new Array();
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

CoordUtils.isRectangle = function anno_isRectangle(c) {
  if ($.isArray(c)) {
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
