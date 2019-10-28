const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware')

const app = express();
const config = require('./../../webpack.config.js');
const compiler = webpack(config);

app.use(express.static(path.join(__dirname, './src/')));
// include public static files later

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
}));

  
module.exports = app;