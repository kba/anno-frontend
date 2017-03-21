var webpack = require('webpack')

module.exports = {
    entry: "./entry.js",
    devtool: 'source-map',
    output: {
        path: __dirname + "/dist",
        filename: "ubhd-anno.js"
    },
    module: {
        loaders: [
            // {
            //     test: require.resolve('tinymce/tinymce'),
            //     loaders: [
            //         'imports-loader?this=>window',
            //         'exports-loader?window.tinymce'
            //     ]
            // },
            // {
            //     test: /tinymce\/(themes|plugins)\//,
            //     loaders: [
            //         'imports-loader?this=>window'
            //     ]
            // },

            // **IMPORTANT** This is needed so that each bootstrap js file required by
            // bootstrap-webpack has access to the jQuery object
            {
                test: /bootstrap\/js\//,
                loader: 'imports-loader?jQuery=jquery'
            },
            {
                test: /\.(eot|svg|ttf|woff2)(\?v=\d+\.\d+\.\d+)?/,
                loader: 'file-loader?emitFile=false',
            },
            {
                test: /\.woff(\?v=\d+\.\d+\.\d+)?/,
                loader: 'url-loader?name=[path][name].[ext]'
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url-loader?limit=100000000000000&emitFile=true&name=/[path][name].[ext]',
                // loader: "file-loader?emitFile=false&name=/[path][name].[ext]"
                // options: {
                    // limit: 250000,
                // },
            },
            {
                test: /\.vue\.html$/,
                loader: "html-loader",
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
        new webpack.DefinePlugin({ 'process.env': { NODE_ENV: `"${process.env.NODE_ENV}"` }})
    ]
};
