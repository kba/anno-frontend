/*jslint indent: 2, maxlen: 80, continue: false, unparam: false, browser: true */
/* -*- tab-width: 2 -*- */
(function () {
  'use strict';
  var cfg = {
    targetImage: ('https://upload.wikimedia.org/wikipedia/commons/thumb/'
      + 'f/fd/Ghostscript_Tiger.svg/1024px-Ghostscript_Tiger.svg.png'),
  };

  cfg.targetThumbnail = cfg.targetImage.replace(/\/1024px-/g, '/200px-');

  window.annoTestCfg = cfg;
}());
