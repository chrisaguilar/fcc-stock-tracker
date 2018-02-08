const {
    cpus
} = require('os');
const {
    join
} = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const extractSass = new ExtractTextPlugin({
    filename: join('../css/style.css'),
    disable: process.env.NODE_ENV !== 'production'
});

module.exports = function (env, args) {
    const config = {
        context: __dirname,
        entry: ['babel-polyfill', join(__dirname, 'src/client/index.tsx')],
        output: {
            filename: '[name].js',
            path: join(__dirname, 'public/js'),
            publicPath: '/public/js/'
        },
        module: {
            rules: [{
                    test: /\.tsx?$/,
                    include: join(__dirname, 'src'),
                    use: [{
                            loader: 'cache-loader',
                            options: {
                                cacheDirectory: join(__dirname, 'node_modules/.cache/cache-loader')
                            }
                        },
                        {
                            loader: 'thread-loader',
                            options: {
                                workers: cpus()
                                    .length - 1
                            }
                        },
                        {
                            loader: 'babel-loader',
                            options: {
                                plugins: ['react-hot-loader/babel'],
                                presets: [
                                    ['@babel/preset-env', {
                                        "targets": {
                                            "browsers": ["last 2 versions", "safari >= 7"]
                                        },
                                        "loose": true,
                                        "modules": false
                                    }], '@babel/preset-stage-0', '@babel/preset-react'
                                ]
                            }
                        },
                        {
                            loader: 'ts-loader',
                            options: {
                                happyPackMode: true,
                                transpileOnly: true
                            }
                        }
                    ]
                },
                {
                    test: /\.s[ac]ss$/,
                    include: join(__dirname, 'src'),
                    use: extractSass.extract({
                        fallback: 'style-loader',
                        use: [{
                                loader: 'css-loader',
                                options: {
                                    camelCase: true,
                                    importLoaders: 2,
                                    localIdentName: process.env.NODE_ENV === 'production' ?
                                        '[hash:base64]' :
                                        '[path][name]__[local]--[hash:base64:5]',
                                    minimize: true,
                                    modules: true
                                }
                            },
                            {
                                loader: 'postcss-loader',
                                options: {
                                    ident: 'postcss',
                                    plugins: (loader) => [require('postcss-cssnext')()]
                                }
                            },
                            {
                                loader: 'sass-loader'
                            }
                        ]
                    })
                }
            ]
        },
        resolve: {
            extensions: ['.js', '.ts', '.jsx', '.tsx', '.sass', '.scss'],
            plugins: [new TsConfigPathsPlugin()]
        },
        plugins: [
            extractSass,
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: (m) => m.context && m.context.includes('node_modules')
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
                minChunks: Infinity
            }),
            new ForkTsCheckerWebpackPlugin({
                checkSyntacticErrors: true,
                tslint: true
            }),
            new HtmlWebpackPlugin({
                inject: false,
                template: require('html-webpack-template'),
                title: 'Hello, World!',
                filename: join(__dirname, 'public/views/index.html'),
                appMountId: 'app',
                cache: true,
                minify: {
                    caseSensitive: true,
                    collapseBooleanAttributes: true,
                    collapseInlineTagWhitespace: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    html5: true,
                    keepClosingSlash: true,
                    removeComments: true,
                    useShortDoctype: true
                },
                alwaysWriteToDisk: true,
                links: [
                    'https://fonts.googleapis.com/css?family=Roboto'
                ]
            })
        ]
    };

    if (process.env.NODE_ENV === 'production') {
        config.plugins.push(
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    compress: true
                }
            })
        );
    } else {
        config.entry.unshift('webpack-hot-middleware/client?reload=true');
        config.plugins.push(
            new HtmlWebpackHarddiskPlugin(),
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoEmitOnErrorsPlugin()
        );
    }

    return config;
};
