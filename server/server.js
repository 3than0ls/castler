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

const UserState = require('./serverStates/userState.js');;
const CreateMap = require('./createMap.js');
const AreaState = require('./serverStates/areaState.js');
const StructureState = require('./serverStates/structureState.js');

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
    areas: {},
    structures: {},
}

const map = new CreateMap(serverState, [2000, 2000]);
map.test(serverState);

/*
const mine = new AreaState({
    type: 'mine',
    globalX: 0,
    globalY: -700,
    entities: [
        {type: 'beetle', amount: 2},
        {type: 'boar', amount: 2},
    ],
    resources: [
        {type: 'iron', amount: 4},
        {type: 'rock', amount: 4}
    ],
    entityLimit: 4,
});
serverState.areas[mine.areaID] = mine;
mine.create(serverState);

const workbench = new StructureState({
    type: 'workbench',
    globalX: -400,
    globalY: 700,
});
serverState.structures[workbench.structureID] = workbench;
workbench.create(serverState);
const furnace = new StructureState({
    type: 'furnace',
    globalX: 400,
    globalY: 700,
});
serverState.structures[furnace.structureID] = furnace;
furnace.create(serverState);*/

const gameItems = require('./items/items.js');
// gameItems.test.test();

function createUser(socketID) {
    let newUserState = new UserState(socketID);
    serverState.users.user[socketID] = newUserState;
    serverState.users.userData[socketID] = newUserState.clientDataPackage();
    console.log("Client joined: " + socketID);
}

io.on('connection', socket => {
    createUser(socket.id);

    // initial variable assignments
    socket.on('nickname', nickname => {
        serverState.users.user[socket.id].nickname = nickname;
    }); // update the server info of the clients nickname when client connects

    socket.emit('playerInit', {
        mapSize: map.size,
        inventory: serverState.users.user[socket.id].inventory,
        toolTier: serverState.users.user[socket.id].toolTier
    }) // provide the connecting client information it needs when it first connects

    socket.on('clientState', data => {
        let user = serverState.users.user[data.id];
        user.updateClientInfo(data.vx, data.vy, data.angle, data.swingAngle, data.displayHand, data.structureHand, data.focused);

        let clientUpdateData = {
            globalX: user.globalX,
            globalY: user.globalY,
            inventory: user.inventory,
            health: user.health,
            hunger: user.hunger,
            score: user.score,
            craftingState:  {
                crafting: user.crafting,
                craftingComplete: user.craftingComplete,
            },

            toolTier: user.toolTier,
            harvestSpeed: user.harvestSpeed,
            attackSpeed: user.attackSpeed,
            displayHand: user.displayHand,
            structureHand: user.structureHand,
        };

        if (user.health <= 0) { // check if client has died
            serverState.users.userData[data.id].dead = true;
            clientUpdateData.dead = true;
        }
        // user.playerTick(); // tick player

        let items = user.craftableItems(gameItems, serverState);
        if (items) {
            socket.emit('craftableItemsUpdate', items);
        }

        socket.emit('clientDataUpdate', clientUpdateData);
    });

    socket.on('clientRequestCraft', data => {
        if (gameItems[data.item]) { // check if item exists
            serverState.users.user[socket.id].craft(gameItems[data.item], serverState.users.user[socket.id]);
        }
    });

    socket.on('clientRequestConsume', data => {
        if (serverState.users.user[socket.id].inventory[data.item]) { // check if inventory item exists
            if (serverState.users.user[socket.id].inventory[data.item].amount > 0) {
                gameItems[data.item].consumeFunction(serverState.users.user[socket.id]);
            }
        }
    });

    socket.on('clientCreateStructure', data => {
        if (serverState.users.user[socket.id].inventory[data.type]) { // test if inventory item exists
            if (serverState.users.user[socket.id].inventory[data.type].amount > 0) {
                let structure = new StructureState({
                    globalX: data.globalX,
                    globalY: data.globalY,
                    type: data.type,
                }, socket.id);
                serverState.structures[structure.structureID] = structure;
                gameItems[data.type].consumeFunction(serverState.users.user[socket.id]);
            }
        }
    })

    socket.on('harvest', data => {
        // subtract the amount harvested from the resource
        serverState.resources[data.resourceID].harvest(data.amount);
        // add the amount harvested to the clients resource pile
        serverState.users.user[socket.id].harvest(serverState.resources[data.resourceID].type, data.amount);

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
        let entityAI = serverState.entities.entityAI[data.entityID];
        let entityState = serverState.entities.entityState[data.entityID];
        entityAI.attacked(serverState.users.user[data.id].damage, serverState.users.user[data.id]);

        /* if the entity was killed */
        if (entityState.killed()) {
            // add the amount harvested from kill to client inventory
            serverState.users.user[socket.id].kill(entityState.loot);
            io.emit('killed', {
                collisionX: data.collisionX,
                collisionY: data.collisionY,
                entityID: data.entityID,
            });

            if (entityState.homeAreaID && entityState.homeAreaID !== 'map') { // if entity had a home area and it isn't the map, decrease areas entity amount
                serverState.areas[entityState.homeAreaID].entityCount--;
            }

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
      for (let [structureID, structure] of Object.entries(serverState.structures)) {
        if (structure.parentID === socket.id) {
            delete serverState.structures[structureID]; // delete structures that were created by the client
        }
      }
      delete serverState.users.user[socket.id]; // delete client data
      delete serverState.users.userData[socket.id];
    });
})

function update(serverState) {
    for (let user of Object.values(serverState.users.user)) {
        user.update(serverState, map);
    }

    for (let area of Object.values(serverState.areas)) {
        area.respawnTick(serverState);
    }
    // updates states and call the entity AIs
    for (let entity of Object.values(serverState.entities.entityAI)) {
        entity.update(serverState, map);
    }

    // emit data (perhaps combine all into one later)
    io.sockets.emit('userStates', serverState.users.userData);
    io.sockets.emit('resourceStates', serverState.resources);
    io.sockets.emit('entityStates', serverState.entities.entityState);
    io.sockets.emit('areaStates', serverState.areas);
    io.sockets.emit('structureStates', serverState.structures);

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
}
  

http.listen(3000, () => {
    setInterval(() => {
        // console.time('update');
        update(serverState)
        // console.timeEnd('update');
    }, 1000/60);    

    console.log('listening on localhost:3000');
});