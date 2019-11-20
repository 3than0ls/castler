const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        app: './public/game.js'
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    devtool: 'inline-source-map',
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: 'public/index.html'
        })
    ],
    module: {
      rules: [
        {
            test: /\.worker\.js$/,
            use: { 
                loader: 'worker-loader' 
            }
        },
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
};