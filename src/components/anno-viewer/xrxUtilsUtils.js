// -*- coding: utf-8, tab-width: 2 -*-
/* eslint-env browser */
'use strict';

const XrxUtils = require('semtonotes-utils');
const autoDefault = require('require-mjs-autoprefer-default-export-pmb');
const parseSimpleSvgMeta = autoDefault(require('parse-simple-svg-meta-pmb'));

const errTrace = 'While calculating IIIF bounds from SVG: ';
const errMsgSizeRequired = ('When IIIF region support is enabled,'
  + ' targetImageWidth and targetImageHeight must be positive numbers.');


function bboxAxisToPct(max, start, end) {
  const pct = { start: start / max, end: end / max };
  pct.dist = pct.end - pct.start;
  return pct;
}


function fmtPct(prec, frac) {
  // Binary vs. decimal rounding: toFixed is good enough for us. [ubhd:236]
  return (frac * 100).toFixed(prec).replace(/\.?0+$/, '');
}


const xuu = {

  calcIiifLink(annoViewerInst) {
    const cfg = (annoViewerInst.$store.state || false);
    let url = cfg.iiifUrlTemplate;
    if (!url) { return; }
    const fracs = xuu.calcIiifBoundsFractions(annoViewerInst);
    if (!fracs) { return; }
    const prec = (+cfg.iiifDecimalPlaces || 5);
    const pct = 'pct:' + [
      fracs.x.start,
      fracs.y.start,
      fracs.x.dist,
      fracs.y.dist,
    ].map(frac => fmtPct(prec, frac)).join(',');
    url = url.replace(/%ir|\{{2}\s*iiifRegion\s*\}{2}/g, pct);
    return url;
  },

  suggestSvgSelectorViewport(annoViewerInst, svgSel) {
    const cfg = (annoViewerInst.$store.state || false);

    // Rely on editor config for target image dimensions,
    // to save us from detecting image size via DOM operations.
    const timW = (+cfg.targetImageHeight || 0);
    const timH = (+cfg.targetImageHeight || 0);
    if ((timW < 1) || (timH < 1)) { throw new RangeError(errMsgSizeRequired); }

    const s = parseSimpleSvgMeta(svgSel);
    const {
      widthPx,
      // widthFrac,
      heightPx,
      heightFrac,
    } = s;

    if (widthPx >= 1) {
      if (heightPx >= 1) {
        return { w: widthPx, h: heightPx, contrived: false, s };
      }

      /* Height fallback:
        Contrive a viewport that preserves aspect ratio.
        This might be non-standard; discussion about this can be found in
        issue [ubhd:235] and https://github.com/w3c/web-annotation/issues/445
      */
      return {
        w: widthPx,
        h: (heightFrac * widthPx * timH) / timW,
        contrived: 'h',
        s,
      };
    }

    throw new Error('SvgSelectors without positive absolute width'
      + 'are not supported yet.');
  },

  calcIiifBoundsFractions(annoViewerInst) {
    const { svgTarget } = annoViewerInst;
    if (!svgTarget) { return; }
    const svgSel = svgTarget.selector.value;
    const viewport = xuu.suggestSvgSelectorViewport(annoViewerInst, svgSel);

    const cfg = (annoViewerInst.$store.state || false);

    let bounds;
    try {
      // temporary DOM element for xrx:
      const tmpEl = window.document.createElement('div');
      if (cfg.debugIiifBounds) {
        tmpEl.className = 'annoeditor-iiif-canvas';
        tmpEl.style.display = 'none';
        annoViewerInst.$el.appendChild(tmpEl);
        console.debug('svgSel tmpEl:', tmpEl);
      }
      const drawing = XrxUtils.createDrawing(tmpEl, viewport.w, viewport.h);

      // Ideally we could use XU.shapesFromSvg, but
      XrxUtils.drawFromSvg(svgSel, drawing, {
        absolute: true,
        // ^-- Without this option, for unknown reasons, the bounding box
        //  turns out subatomically tiny: [[0, 5e-324], [0, 5e-324]]
        grouped: false,
        // ^-- because XU.boundingBox doesn't support groups yet.
      });
      const bbox = XrxUtils.boundingBox(drawing);
      const [[left, top], [right, bottom]] = bbox;
      bounds = {
        x: bboxAxisToPct(viewport.w, left, right),
        y: bboxAxisToPct(viewport.h, top, bottom),
        debug: {
          viewport,
          left,
          right,
          top,
          bottom,
        },
      };
      if (cfg.debugIiifBounds) { console.debug('debugIiifBounds:', bounds); }
      if (tmpEl.parentNode && (!cfg.debugIiifBounds)) {
        tmpEl.parentNode.removeChild(tmpEl);
      }
    } catch (boundsErr) {
      const err = new Error(errTrace + String(boundsErr));
      err.reason = boundsErr;
      throw err;
    }
    if (!bounds) { throw new Error(errTrace + 'Exotic control flow failure'); }
    return bounds;
  },

};


// window.xuu = xuu;
module.exports = xuu;
