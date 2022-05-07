/* -*- tab-width: 2 -*- */
'use strict';

const webpack = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin-next');
const absPath = require('absdir')(module, '.');

const sourceMapOpts = {
};


const shellPluginOpts = {};
const shellPluginEvents = [
  'onBeforeBuild',
  'onBuildStart',
  'onBuildError',
  'onBuildEnd',
  'onBuildExit',
  'onWatchRun',
  'onDoneWatch',
  'onBeforeNormalRun',
  'onAfterDone',
];
shellPluginEvents.forEach(function registerHook(ev) {
  const hookCmd = ('./build/webpack-hooks.sh '
    + ev.replace(/([A-Z])/g, '_$1').toLowerCase());
  shellPluginOpts[ev] = {
    scripts: [hookCmd],
    blocking: true,
    parallel: false,
  };
});


module.exports = {
  entry: './entry.js',
  mode: (function guessAudience() {
    const a = (process.env.WEBPACK_AUDIENCE || 'dev');
    if (a === 'prod') { return 'production'; }
    if (a === 'dev') { return 'development'; }
    return a;
  }()),
  devtool: false,
  // node: {fs: 'empty'},
  // target: 'node',
  plugins: [
    new webpack.SourceMapDevToolPlugin(sourceMapOpts),
    new WebpackShellPlugin(shellPluginOpts),
  ],
  output: {
    path: absPath('dist'),
    filename: `anno-frontend.js`,
  },
  optimization: {
    moduleIds: 'deterministic',
  },
  devServer: {
    publicPath: '/dist/',
    compress: true,
  },
  externals: {
    'jquery': '$',
    'quill/dist/quill.js': 'Quill',
    'axios': 'axios',
    '@ubhd/authorities-client': 'AuthoritiesClient',
    'semtonotes-utils': 'XrxUtils',
    '@kba/anno-store': 'Anno.Store',
    '@kba/anno-queries': 'Anno.Queries',
    '@kba/anno-store-http': 'Anno.HttpStore',
    '@kba/anno-errors': 'Anno.Errors',
    '@kba/xrx-vue': 'XrxVue',
  },
  resolve: {
    alias: {
      '@': absPath('src'),
      // 'vue$': 'vue/dist/vue.esm.js',
      'vue$': 'vuejs-debug-traverse-210506-pmb/vue.esm.js',
      'vuex$': 'vuex/dist/vuex.esm.js',
      'quill$': 'quill/dist/quill.min.js',
      // 'axios': 'axios/dist/axios.min.js',
    },
  },
  module: {
    rules: [
      { test: /\.png$/i,
        loader: 'url-loader',
      },
      { test: /\.svg$/i,
        loader: 'url-loader',
      },
      { test: /\/src\/components\/\S+.html$/,
        use: {
          loader: 'html-loader',
          options: {
            attrs: 'img:src bootstrap-button:src',
          },
        },
      },
      { test: /\.js$/,
        exclude: /\/node_modules\//,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: true },
        },
      },
      { test: { or: [
          /\/node_modules\/quill\/\S+\.css$/,
          /\/src\/components\/\S+\.(s?css|sass)$/,
        ] },
        use: [
          // Order might be important here!
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
    ],
  },
};
