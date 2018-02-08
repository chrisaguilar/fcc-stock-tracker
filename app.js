/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("webpack");

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const http_1 = __webpack_require__(4);

const path_1 = __webpack_require__(0);

const util_1 = __webpack_require__(5);

const dotenv_1 = __importDefault(__webpack_require__(6));

const ejs_1 = __importDefault(__webpack_require__(7));

const express_1 = __importDefault(__webpack_require__(1));

const morgan_1 = __importDefault(__webpack_require__(8));

const redis_1 = __importDefault(__webpack_require__(9));

const socket_io_1 = __importDefault(__webpack_require__(10));

const webpack_1 = __importDefault(__webpack_require__(2));

const webpack_dev_middleware_1 = __importDefault(__webpack_require__(11));

const webpack_hot_middleware_1 = __importDefault(__webpack_require__(12));

const api_1 = __webpack_require__(13);

dotenv_1.default.config();
const app = express_1.default();
const client = redis_1.default.createClient();

const config = __webpack_require__(16)();

const compiler = webpack_1.default(config);
const HDelAsync = util_1.promisify(client.hdel).bind(client);
const HGetAsync = util_1.promisify(client.hget).bind(client);
const HGetAllAsync = util_1.promisify(client.hgetall).bind(client);
const HSetAsync = util_1.promisify(client.hset).bind(client);
const server = http_1.createServer(app);
const io = socket_io_1.default(server);
app.enable('trust proxy');
app.engine('html', ejs_1.default.renderFile);
app.set('view engine', 'html');
app.set('views', path_1.join(__dirname, 'public/views'));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan_1.default('dev'));
  app.use(webpack_dev_middleware_1.default(compiler, {
    publicPath: config.output.publicPath,
    stats: 'minimal'
  }));
  app.use(webpack_hot_middleware_1.default(compiler));
}

app.use('/api/stocks', api_1.stocks);
app.use('/public', express_1.default.static(path_1.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.render('index');
});
io.on('connection', socket => {
  socket.on('join', async () => {
    try {
      socket.emit('initial', (await HGetAllAsync('stocks')));
    } catch (e) {
      console.error(e);
    }
  });
  socket.on('add', async ({
    data,
    symbol
  }) => {
    try {
      await HSetAsync('stocks', symbol, data);
      io.emit('add', {
        data: await HGetAsync('stocks', symbol),
        symbol
      });
    } catch (e) {
      console.error(e);
    }
  });
  socket.on('remove', async symbol => {
    try {
      await HDelAsync('stocks', symbol);
      io.emit('remove', symbol);
    } catch (e) {
      console.error(e);
    }
  });
});
server.listen(process.env.NODE_ENV);

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("util");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = require("ejs");

/***/ }),
/* 8 */
/***/ (function(module, exports) {

module.exports = require("morgan");

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = require("redis");

/***/ }),
/* 10 */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("webpack-dev-middleware");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("webpack-hot-middleware");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

__export(__webpack_require__(14));

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const axios_1 = __importDefault(__webpack_require__(15));

const express_1 = __importDefault(__webpack_require__(1));

const stocks = express_1.default.Router();
exports.stocks = stocks;
stocks.get('/:symbol', async (req, res, next) => {
  try {
    const {
      data
    } = await axios_1.default({
      method: 'get',
      baseURL: 'https://www.alphavantage.co/query',
      params: {
        apikey: process.env.ALPHA_VANTAGE_API_KEY,
        function: 'TIME_SERIES_DAILY',
        outputsize: 'full',
        symbol: req.params.symbol
      }
    });
    res.json(data);
  } catch (e) {
    next(e);
  }
});

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

const {
    cpus
} = __webpack_require__(17);
const {
    join
} = __webpack_require__(0);

const ExtractTextPlugin = __webpack_require__(18);
const ForkTsCheckerWebpackPlugin = __webpack_require__(19);
const HtmlWebpackHarddiskPlugin = __webpack_require__(20);
const HtmlWebpackPlugin = __webpack_require__(21);
const TsConfigPathsPlugin = __webpack_require__(22);
const UglifyJsPlugin = __webpack_require__(23);
const webpack = __webpack_require__(2);

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
                                    plugins: (loader) => [__webpack_require__(24)()]
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
                template: __webpack_require__(25),
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


/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = require("os");

/***/ }),
/* 18 */
/***/ (function(module, exports) {

module.exports = require("extract-text-webpack-plugin");

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("fork-ts-checker-webpack-plugin");

/***/ }),
/* 20 */
/***/ (function(module, exports) {

module.exports = require("html-webpack-harddisk-plugin");

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("html-webpack-plugin");

/***/ }),
/* 22 */
/***/ (function(module, exports) {

module.exports = require("tsconfig-paths-webpack-plugin");

/***/ }),
/* 23 */
/***/ (function(module, exports) {

module.exports = require("uglifyjs-webpack-plugin");

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = require("postcss-cssnext");

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = require("html-webpack-template");

/***/ })
/******/ ]);