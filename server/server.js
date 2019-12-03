const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const UserState = require('./serverStates/userState.js');
const ResourceState = require('./serverStates/resourceState.js');
const EntityState = require('./serverStates/entityState.js');
const EntityAI = require('./serverStates/entityAI.js');

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
    entities: {
        entityState: {}, // the data we send to the client holding positioning and other info about entities
        entityAI: {},  // controls the entity and tells it where to move, but the functions used don't need to be sent to client
    },
}

function createResourceTest() {
    let resource = new ResourceState(300, 300, 'rock');
    serverState.resources[resource.resourceID] = resource;
    let resource2 = new ResourceState(-100, -100, 'tree');
    serverState.resources[resource2.resourceID] = resource2;
};
createResourceTest();


function createEntityTest() {
    for (let i = 0; i < 50; i ++) {
        let entity = new EntityState(75, -75, 'duck', 'passive');
        serverState.entities.entityState[entity.entityID] = entity;
        serverState.entities.entityAI[entity.entityID] = new EntityAI(entity.entityID, entity);
    }
};
createEntityTest();

io.on('connection', socket => {
    serverState.users[socket.id] = new UserState(socket.id);
    // on received events, data.id should be equal to socket.id
    console.log("Client data: " + JSON.stringify(serverState.users[socket.id]));

    socket.emit('playerInit', {
        resources: serverState.users[socket.id].resources
    }) // provide the connecting client information it needs when it first connects

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
            collisionX: data.collisionX,
            collisionY: data.collisionY,
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
    // emit data
    io.sockets.emit('userStates', serverState.users);
    io.sockets.emit('resourceStates', serverState.resources);
    io.sockets.emit('entityStates', serverState.entities.entityState);
    
    // updates states and call the entity AIs
    const entityIDs = Object.keys(serverState.entities.entityAI);
    for(let i = 0; i < entityIDs.length; i++) {
        serverState.entities.entityAI[entityIDs[i]].update(serverState);
    }
}
  

http.listen(3000, () => {
    setInterval(() => {update(serverState)}, 1000/60);
    console.log('listening on localhost:3000');
});