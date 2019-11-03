const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const http = require('http').Server(app);

const config = require('../webpack.config.js');
const compiler = webpack(config);

app.use(express.static(path.join(__dirname, './src/')));


app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
}));

const io = require('socket.io')(http);

const serverState = {
    users: {}
}

io.on('connection', function(socket) {
    serverState[socket.id] = socket;
    console.log(socket.id + " has connected.");
    console.log('all users:')
    
    let userids = Object.keys(serverState.users);
    for(let i = 0; i < userids.length; i ++) {
        console.log(serverState.users[uerids[i]]);
    }

})
  

http.listen(3000, () => {
    console.log('listening on localhost:3000');
});