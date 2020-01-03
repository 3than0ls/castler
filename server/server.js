const express = require('express');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const configs = require('../webpack.config.js');
for (let i = 0; i < configs.length; i++) {
    let configCompiler = webpack(configs[i]);
    app.use(webpackDevMiddleware(configCompiler, {
        publicPath: configs[i].output.publicPath,
    }));
}


// app.use(express.static(path.join(__dirname, './src/')));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, './public/')));

const UserState = require('./serverStates/userState.js');
const CreateMap = require('./createMap.js');

const serverState = {
    users: {
        userData: {}, // data we send to clients
        user: {},   // data that controls and has functions of the user
    },
    resources: {}, 
    entities: {
        entityState: {}, // the data we send to the client holding positioning and other info about entities
        entityAI: {},  // controls the entity and tells it where to move, but the functions used don't need to be sent to client
    },
}

const map = new CreateMap(serverState);
map.test();

const gameItems = require('./items/items.js');
// gameItems.test.test();


io.on('connection', socket => {
    let newUserState = new UserState(socket);
    serverState.users.user[socket.id] = newUserState;
    serverState.users.userData[socket.id] = newUserState.clientDataPackage();
    // on received events, data.id should be equal to socket.id
    console.log("Client joined: " + serverState.users.user[socket.id].clientID);

    // initial variable assignments
    socket.on('nickname', nickname => {
        serverState.users.user[socket.id].nickname = nickname;
    }) // update the server info of the clients nickname when client connects
    socket.emit('playerInit', {
        inventory: serverState.users.user[socket.id].inventory
    }) // provide the connecting client information it needs when it first connects

    socket.on('clientState', data => {
        serverState.users.user[data.id].updateClientInfo(data.globalX, data.globalY, data.angle, data.swingAngle, data.displayHand);
        let clientUpdateData = {
            inventory: serverState.users.user[data.id].inventory,
            health: serverState.users.user[data.id].health,
            hunger: serverState.users.user[data.id].hunger,
            score: serverState.users.user[data.id].score,
            craftingState:  {
                crafting: serverState.users.user[data.id].crafting,
                craftingComplete: serverState.users.user[data.id].craftingComplete,
            }
        };

        serverState.users.userData[data.id] = serverState.users.user[data.id].clientDataPackage(); // update data packge
        if (serverState.users.user[data.id].health <= 0) { // check if client has died
            serverState.users.userData[data.id].dead = true;
            clientUpdateData.dead = true;
        }
        serverState.users.user[data.id].playerTick(); // tick player

        const craftableItems = [];
        for (item in gameItems) {
            if (gameItems[item].canCraft(serverState.users.user[data.id].inventory)) {
                craftableItems.push(gameItems[item].name);
            }
        }
        // console.log(JSON.stringify(craftableItems));
        socket.emit('craftableItemsUpdate', craftableItems);

        socket.emit('clientDataUpdate', clientUpdateData);
    });

    socket.on('clientRequestCraft', data => {
        if (gameItems[data.item]) { // check if item exists
            serverState.users.user[socket.id].craft(gameItems[data.item]);
        }
    });

    socket.on('clientRequestConsume', data => {
        if (serverState.users.user[socket.id].inventory[data.item].amount > 0) {
            gameItems[data.item].consumeFunction(serverState.users.user[socket.id]);
        }
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

    // emit leaderboard status (based on player score)
    const orderedPlayerScores = [];
    for (let playerID in serverState.users.userData) {
        let score = serverState.users.userData[playerID].score;
        orderedPlayerScores.push([playerID, score]);
    }
    orderedPlayerScores.sort(function(a, b) {
        return b[1] - a[1];
    });

    const leaderboardState = [];
    orderedPlayerScores.forEach(element => {
        leaderboardState.push({
            clientID: element[0],
            score: element[1],
            nickname: serverState.users.userData[element[0]].nickname, // element[0] is the player ID
        });
    });
    
    io.sockets.emit('leaderboardUpdate', leaderboardState);
    
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