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
            // **IMPORTANT** This is needed so that each bootstrap js file required by
            // bootstrap-webpack has access to the jQuery object
            {
                test: /bootstrap\/js\//,
                loader: 'imports-loader?jQuery=jquery'
            },
            {
                test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
                loader: 'file-loader?emitFile=false&name=[path][name].[ext]'
            },
            {
                test: /\.(png|jpg)$/,
                loader: "file-loader?emitFile=false&name=[path][name].[ext]"
            },
            {
                test: /\.vue\.html$/,
                loader: "raw-loader",
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