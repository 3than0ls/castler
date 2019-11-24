const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const UserState = require('./serverStates/userState.js');
const ResourceState = require('./serverStates/resourceState.js');

const app = express();
const http = require('http').Server(app);

const config = require('../webpack.config.js');
const compiler = webpack(config);

// app.use(express.static(path.join(__dirname, './src/')));
app.use(express.static(path.join(__dirname, './public/')));

app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath
}));

const io = require('socket.io')(http);

const serverState = {
    users: {},
    resources: {}, 
}

function createResourceTest() {
    /*/ creates a test map with resources
    for(let i = 0; i < 2; i++) {
        for(let j = 0; j < 2; j++) {
            let type = 'rock';
            if (j % 2 == 0 ) type = 'tree'a
            let resource = new ResourceState(-400+i*400, -400+j*400, type);
            serverState.resources[resource.resourceID] = resource;
        }
    }*/
    let resource = new ResourceState(300, 300, 'rock');
    serverState.resources[resource.resourceID] = resource;
    let resource2 = new ResourceState(-350, -270, 'tree');
    serverState.resources[resource2.resourceID] = resource2;
};
createResourceTest();

io.on('connection', socket => {
    serverState.users[socket.id] = new UserState(socket.id);
    // on received events, data.id should be equal to socket.id
    console.log("Client data: " + JSON.stringify(serverState.users[socket.id]));

    socket.emit('inventoryUpdate', serverState.users[socket.id].resources) // "create" the client inventory by updating it, maybe move to a connect event

    socket.on('clientState', data => {
        serverState.users[data.id].updateClientInfo(data.globalX, data.globalY, data.angle, data.swingAngle, data.displayHand);
    });

    socket.on('harvest', data => {
        // subtract the amount harvested from the resource
        serverState.resources[data.resourceID].harvest(data.amount);
        // add the amount harvested to the clients resource pile
        serverState.users[data.id].harvest(serverState.resources[data.resourceID].type, data.amount);
        // emit harvest event occuring
        io.emit('harvested', { // harvested only provides a visual effect, and nothing else
            vx: data.vx,
            vy: data.vy,
            resourceID: data.resourceID,
            harvestSpeed: data.harvestSpeed
        });
        socket.emit('inventoryUpdate', serverState.users[socket.id].resources) // update the clients inventory
    });

    // when disconnected, remove user from server state
    socket.on('disconnect', () => {
      socket.broadcast.emit('userLeave', socket.id);
      delete serverState.users[socket.id];
    });
})

function update(serverState) {  
    io.sockets.emit('userStates', serverState.users);
    io.sockets.emit('resourceStates', serverState.resources);
}
  
setInterval(() => {update(serverState)}, 1000/60);

http.listen(3000, () => {
    console.log('listening on localhost:3000');
});