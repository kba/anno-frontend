/* -*- tab-width: 2 -*- */
'use strict';

/*  NOT eslint-env browser: We want these files to be loadable in node.js
    as well, so we can do automated unit tests. */
// eslint-disable-next-line no-undef
const win = ((typeof window !== 'undefined') && window);

const annoDataCfg = {

  targetSource: (win && win.location.href), /*
    The target of the annotation.
    In case of a targetImage (below): The URL of the website that
    displays the annotations about the image.
  */

  targetImage: null, /*
    In case of annotations about an image, URL of an image file in
    default (usually: original) resolution.
  */
  targetImageHeight: -1,
  targetImageWidth: -1,
  targetThumbnail: null,

  targetFragment: null,

  iiifUrlTemplate: null,
  // ^-- URL template the IIIF image (see `user-interface.js`)





};


module.exports = annoDataCfg;
