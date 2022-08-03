// This file is to help dependency scanners find dependencies that are
// somewhat hidden.
'use strict';

require('font-awesome');
require('vuejs-debug-traverse-210506-pmb');


// css-loader for Vue components
require('css-loader');
require('sass-loader');
require('sass');
require('style-loader');



// for ../.babelrc:
require('@babel/plugin-transform-runtime');
require('@babel/preset-env');
require('@babel/preset-stage-2');
require('@babel/runtime');


