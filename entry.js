// Bootstrap
require('bootstrap-webpack!./bootstrap.config.js');

// Font Awesome
require('style-loader!css-loader!font-awesome/css/font-awesome.css');

// Stylesheet
require('style-loader!css-loader!./css/annotations.css')

// Code
window.UBHDAnnoApp = require('./src/annotations.js')
