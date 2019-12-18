const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const configs = require('../webpack.config.js');
const gameConfig = configs[0];
const gameCompiler = webpack(gameConfig);
app.use(webpackDevMiddleware(gameCompiler, {
    publicPath: gameConfig.output.publicPath
}));
const menuConfig = configs[1];
const menuCompiler = webpack(menuConfig)
app.use(webpackDevMiddleware(menuCompiler, {
    publicPath: menuConfig.output.publicPath
}));


// app.use(express.static(path.join(__dirname, './src/')));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, './public/')));
app.use(express.static(path.join(__dirname, './menu/')));

const UserState = require('./serverStates/userState.js');
const CreateMap = require('./createMap.js');

const serverState = {
    users: {
        userData: {},
        user: {},
    },
    resources: {}, 
    entities: {
        entityState: {}, // the data we send to the client holding positioning and other info about entities
        entityAI: {},  // controls the entity and tells it where to move, but the functions used don't need to be sent to client
    },
}

const map = new CreateMap(serverState);
map.test();




io.on('connection', socket => {
    let newUserState = new UserState(socket);
    serverState.users.user[socket.id] = newUserState;
    serverState.users.userData[socket.id] = newUserState.clientDataPackage();
    // on received events, data.id should be equal to socket.id
    console.log("Client joined: " + serverState.users.user[socket.id].clientID);

    socket.emit('playerInit', {
        inventory: serverState.users.user[socket.id].inventory
    }) // provide the connecting client information it needs when it first connects

    socket.on('clientState', data => {
        serverState.users.user[data.id].updateClientInfo(data.globalX, data.globalY, data.angle, data.swingAngle, data.displayHand);
        socket.emit('clientDataUpdate', {
            inventory: serverState.users.user[data.id].inventory,
            health: serverState.users.user[data.id].health,
        })
        serverState.users.userData[data.id] = serverState.users.user[data.id].clientDataPackage();
    });

    socket.on('harvest', data => {
        // subtract the amount harvested from the resource
        serverState.resources[data.resourceID].harvest(data.amount);
        // add the amount harvested to the clients resource pile
        serverState.users.user[data.id].harvest(serverState.resources[data.resourceID].type, data.amount);
        // emit harvest event occuring
        io.emit('harvested', { // harvested only provides a visual effect, and nothing else
            vx: data.vx,
            vy: data.vy,
            collisionX: data.collisionX,
            collisionY: data.collisionY,
            resourceID: data.resourceID,
            harvestSpeed: data.harvestSpeed
        });
        socket.emit('inventoryUpdate', serverState.users.userData[socket.id].inventory) // update the clients inventory
    });

    socket.on('attack', data => {
        // subtract the amount of health that the entity took
        let entityAI = serverState.entities.entityAI[data.entityID]
        let entityState = serverState.entities.entityState[data.entityID]
        entityAI.attacked(data.damage, serverState.users.user[socket.id]);

        /* if the entity was killed */
        if (entityState.killed()) {
            // add the amount harvested from kill to client inventory
            serverState.users.user[data.id].kill(entityState.loot);
            io.emit('killed', {
                collisionX: data.collisionX,
                collisionY: data.collisionY,
                entityID: data.entityID,
            });
            socket.emit('inventoryUpdate', serverState.users.userData[socket.id].inventory) // update the clients inventory
            delete serverState.entities.entityAI[entityState.entityID];
            delete serverState.entities.entityState[entityState.entityID];
        } else {
            // emit attack event occuring
            io.emit('attacked', { // attacked only provides a visual effect, and nothing else
                vx: data.vx,
                vy: data.vy,
                collisionX: data.collisionX,
                collisionY: data.collisionY,
                entityID: data.entityID,
                entitySpeed: data.entitySpeed
            });
        }
    });

    // when disconnected, remove user from server state
    socket.on('disconnect', () => {
      socket.broadcast.emit('userLeave', socket.id);
      delete serverState.users.user[socket.id];
      delete serverState.users.userData[socket.id];
    });
})

function update(serverState) {  
    // emit data
    io.sockets.emit('userStates', serverState.users.userData);
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