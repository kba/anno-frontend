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
                loader: "url-loader"
            },
            {
                test: /components\/.*?\.html$/,
                loader: "html-loader?attrs=img:src bootstrap-button:src",
            },
            {
                test: /components\/.*\.s?css$/,
                loader: "style-loader!css-loader!sass-loader",
            },
            {test: /.*\.js$/, exclude: /node_modules/, loader: 'babel-loader?cacheDirectory'},
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js',
            'quill$': 'quill/dist/quill.min.js',
            'async$': 'async/dist/async.min.js',
            'axios$': 'axios/dist/axios.min.js',
        }
    },
    plugins: [
        // This will replace the string (!) process.env.NODE_ENV in the source
        // code with the value of the NODE_ENV env var, hence nested quotes.
        new webpack.DefinePlugin({ 'process.env': {
            NODE_ENV: `"${process.env.NODE_ENV}"`,
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
