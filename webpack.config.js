var webpack = require('webpack')

module.exports = {
    entry: "./entry.js",
    devtool: 'source-map',
    node: { fs: 'empty' },
    output: {
        path: __dirname + "/dist",
        filename: "ubhd-anno.js"
    },
    module: {
        loaders: [
            // **IMPORTANT** This is needed so that each bootstrap js file required by
            // bootstrap-webpack has access to the jQuery object
            {
                test: /bootstrap\/js/,
                loader: 'imports-loader?jQuery=jquery'
            },
            {
                test: /bootstrap.config.js$/,
                loader: 'bootstrap-webpack',
            },
            {
                test: /font-awesome.css$/,
                loader: 'style-loader!css-loader',

            },
            {
                test: /\.(eot|svg|ttf)(\?v=\d+\.\d+\.\d+)?/,
                loader: 'file-loader?emitFile=false',
            },
            {
                test: /\.woff2?(\?v=\d+\.\d+\.\d+)?/,
                loader: 'url-loader?name=[path][name].[ext]'
            },
            {
                test: /\.(png|jpg)$/,
                // loader: 'url-loader?limit=100000000000000&emitFile=true&name=/[path][name].[ext]',
                loader: "file-loader?emitFile=true&name=/[path][name].[ext]"
            },
            {
                test: /components\/.*?\.html$/,
                loader: "html-loader",
            },
            {
                test: /components\/.*?\.css$/,
                loader: "style-loader!css-loader",
            },
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        }
    },
    plugins: [
        // This will replace the string (!) process.env.NODE_ENV in the source
        // code with the value of the NODE_ENV env var, hence nested quotes.
        new webpack.DefinePlugin({ 'process.env': {
            NODE_ENV: `"${process.env.NODE_ENV}"`,
            UBHDANNO_TOKEN: "'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoicnQxMjZAdW5pLWhlaWRlbGJlcmcuZGUiLCJzZXJ2aWNlIjoiZGlnbGl0Iiwid3JpdGUiOjEsImV4cCI6MzE1MzYwMDAwfQ.h7WZ_gmWNv-uCjoobLCiHH_voinj8dddnjMBZsmCJ8o'"
        }})
    ]
}
if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      compress: {
        warnings: false
      }
    })
  ])
}
