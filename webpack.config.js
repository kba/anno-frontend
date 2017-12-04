const webpack = require('webpack')
const path = require('path')

// detect if webpack bundle is being processed in a production or development env
let prodBuild = require('yargs').argv.p || false

module.exports = {
    entry: "./entry.js",
    devtool: 'source-map',
    node: {fs: 'empty'},
    // target: 'node',
    output: {
        path: __dirname + "/dist",
        filename: `anno-frontend.js`,
    },
    externals: {
        'jquery': "$",
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
            '@': path.join(__dirname, 'src'),
            'vue$': 'vue/dist/vue.min.js',
            'quill$': 'quill/dist/quill.min.js',
            'async$': 'async/dist/async.min.js',
            // 'axios': 'axios/dist/axios.min.js',
        }
    },
    module: {
        loaders: [
            {test: /png$/i, loader: "url-loader"},
            {test: /svg$/i, loader: "url-loader"},
            {test: /components\/.*?\.html$/, loader: "html-loader?attrs=img:src bootstrap-button:src"},
            {test: /.*\.js$/, exclude: /node_modules/, loader: 'babel-loader?cacheDirectory'},
            {test: /components\/.*?\.s?[ac]ss$/, loader: "style-loader!css-loader?sourcemap=true!sass-loader?sourcemap-=true"},
        ]
    },
    plugins: [
        new webpack.DefinePlugin({'process.env': {
          NODE_ENV: prodBuild ? '"production"' : '"development"',
        }}),
        new (require('uglifyjs-webpack-plugin'))({
        })

    ]
}
