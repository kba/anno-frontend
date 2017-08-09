var webpack = require('webpack')

module.exports = {
    entry: "./entry.js",
    devtool: 'source-map',
    node: { fs: 'empty' },
    // target: 'node',
    output: {
        path: __dirname + "/dist",
        filename: "anno-frontend.js",
        publicPath: '//anno.ub.uni-heidelberg.de/anno/dist/',
    },
    externals: {
        'jquery': "$",
        'quill/dist/quill.js': 'Quill',
        'axios': 'axios',
        'semtonotes-utils': 'XrxUtils',
        '@kba/anno-store': 'Anno.Store',
        '@kba/anno-queries': 'Anno.Queries',
        '@kba/anno-store-http': 'Anno.HttpStore',
        '@kba/anno-errors': 'Anno.Errors',
        '@kba/xrx-vue': 'XrxVue',
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.min.js',
            'quill$': 'quill/dist/quill.min.js',
            'async$': 'async/dist/async.min.js',
            // 'axios': 'axios/dist/axios.min.js',
        }
    },
    module: {
        loaders: [
            {test: /png$/i, loader: "file-loader"},
            {test: /svg$/i, loader: "file-loader"},
            {test: /components\/.*?\.html$/, loader: "html-loader?attrs=img:src bootstrap-button:src" },
            {test: /.*\.js$/, exclude: /node_modules/, loader: 'babel-loader?cacheDirectory'},
            {test: /components\/.*?\.s?[ac]ss$/, loader: "style-loader!css-loader?sourcemap=true!sass-loader?sourcemap-=true" },
        ]
    },
    plugins: [
        new webpack.DefinePlugin({ 'process.env': {
            NODE_ENV: '"production"',
        }})
    ]
}
