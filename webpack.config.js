const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkerPlugin = require('worker-plugin');

const config = {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        app: './public/app.js',
        menu: './public/menu/menu.js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            inject: false,
            template: 'public/index.html'
        }),
        new WorkerPlugin({
            globalObject: 'self',
        })
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    module: {
      rules: [
        {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader'
            ],
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                'file-loader'
            ]
        },
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env', '@babel/preset-react'],
                }
            }
        }
      ]
    }
}

const commonConfig = {
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
      rules: [
        {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader'
            ],
        },
        {
            test: /\.(png|svg|jpg|gif)$/,
            use: [
                'file-loader'
            ]
        },
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env', '@babel/preset-react'],
                }
            }
        }
      ]
    }
}

const menuConfig = Object.assign({}, commonConfig, {
    name: "menu",
    entry: {
        app: './menu/menu.js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            inject: false,
            template: 'menu/menu.html'
        }),
    ],
    output: {
        filename: 'menu.bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
});

const gameConfig = Object.assign({}, commonConfig, {
    name: "game",
    entry: {
        app: './public/game.js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'public/index.html'
        }),
        new WorkerPlugin({
            globalObject: 'self',
        })
    ],
    output: {
        filename: 'game.bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/game'
    },
});

// module.exports = [ gameConfig, menuConfig ];
module.exports = [ config ];