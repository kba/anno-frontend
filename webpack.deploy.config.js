var webpack = require('webpack')

module.exports = {
    entry: "./entry.prod.js",
    devtool: 'source-map',
    node: { fs: 'empty' },
    // target: 'node',
    output: {
        path: __dirname + "/dist",
        filename: "ubhd-anno.prod.js",
        publicPath: 'http://anno.ub.uni-heidelberg.de/dist/',
    },
    externals: {
        jquery: "$",
        tinymce: 'tinymce',
        bootstrap: 'bootstrap',
        // vue: 'vue',
        // vuex: 'vuex',
        // 'semtonotes-utils': 'XrxUtils',
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        }
    },
    module: {
        loaders: [
            {test: /png$/i, loader: "file-loader"},
            {test: /components\/.*?\.html$/, loader: "html-loader?attrs=img:src bootstrap-button:src" },
            {
                test: /components\/.*?\.s?css$/,
                loader: "style-loader!css-loader?sourcemap=true!sass-loader?sourcemap-=true"
            },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({ 'process.env': {
            NODE_ENV: `"${process.env.NODE_ENV}"`,
        }})
    ]
}
