const webpack = require('webpack')
const path = require('path')

module.exports = {
    entry: "./entry.js",
    devtool: 'source-map',
    node: {fs: 'empty'},
    // target: 'node',
    output: {
        path: __dirname + "/dist",
        filename: `anno-frontend.js`,
    },
    devServer: {
        publicPath: '/dist/',
        compress: true
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
            'vue$': 'vue/dist/vue.esm.js',
            'vuex$': 'vuex/dist/vuex.esm.js',
            'quill$': 'quill/dist/quill.min.js',
            // 'axios': 'axios/dist/axios.min.js',
        }
    },
    module: {
        rules: [
            {
                test: /png$/i,
                loader: "url-loader"
            },
            {
                test: /svg$/i,
                loader: "url-loader"
            },
            {
                test: /components\/.*?\.html$/,
                use: {
                    loader: "html-loader",
                    options: {
                        attrs: 'img:src bootstrap-button:src'
                    }
                }
            },
            {
                test: /.*\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }
            },
            {
                test: /components\/.*?\.s?[ac]ss$/,
                use: [
                    "style-loader",
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            }
        ]
    },
}
