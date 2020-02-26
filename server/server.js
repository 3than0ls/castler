

/*
    TO DO:
    ISSUES: 
    need to IMPROVE scroll bar to crates
    crafting bar does not seem to function correctly, perhaps replace with a circular loader and just have number/text?
    death menu doesn't work

    BIG:
    create walking particle

    turn boundaries into a map/game client side class, where we can implement time cycles normally (read code cleanup description)

    SMALL:
    more different resources, areas, entities, weapons, 
    create sprites for armor
    custom scroll bars with different IDs/class names


    CODE CLEANING:
        - transfer EVERY config (entity data, resource data, weapon stats, armor stats) to config files into gameConfigs, and eliminate all need for switch statements
        - create a server state class with appopriate functions whose main purpose is to contain the serverState and update it
        - create a client state class with appropriate functions, which include containing the clientState, updating it, updating boundaries, running day/night cycles, and other types of things that don't seem to have a place
*/

const express = require('express');
const path = require('path');
const cacheControl = require('express-cache-controller');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


const config = require('../webpack.config.js');
let configCompiler = webpack(config);
app.use(webpackDevMiddleware(configCompiler));


// app.use(express.static(path.join(__dirname, './src/')));
app.use(cacheControl())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, './public/')));

/*app.post('/', (req, res, next) => { LOOK INTO AJAX
    console.log(req.body);
    /*
        client(submit form with name)---------------\
            |                                        |
        client(create and connect socket)       client(post form data {nickname})
            |                                                         \
        server(create socket userState in serverState)              server(send client rest of game )
    
})*/

const UserState = require('./serverStates/userState.js');;
const CreateMap = require('./createMap.js');
const StructureState = require('./serverStates/structureState.js');

const serverState = {
    users: {
        userData: {}, // data we send to clients
        user: {},   // data that controls and has functions of the user
    },
    resources: {
        resourceData: {},
        resource: {},
    }, 
    entities: {
        entityData: {}, // the data we send to the client holding positioning and other info about entities
        entity: {},  // controls the entity and tells it where to move, but the functions used don't need to be sent to client
    },
    areas: {
        areaData: {},
        area: {},
    },
    structures: {
        structureData: {},
        structure: {},
    },
    crates: {
        crateData: {},
        crate: {},
    }, // crates are containers of dropped items from players

    timeTick: 4000,
}

const map = new CreateMap(serverState, [1400, 1400]);
map.test4(serverState);

const gameItems = require('./gameConfigs/items.js');

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

    socket.emit('connected');

    socket.emit('playerInit', {
        mapSize: map.size,
        inventory: serverState.users.user[socket.id].inventory,
        toolTier: serverState.users.user[socket.id].toolTier
    }) // provide the connecting client information it needs when it first connects

    socket.on('clientState', data => {
        let user = serverState.users.user[data.id];
        user.updateClientInfo(data.vx, data.vy, data.angle, data.swingAngle, data.displayHand, data.structureHand, data.focused, data.openCrate);

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
            effects: user.effects,
            toolTier: user.toolTier,
            armorTier: user.armorTier,
            harvestSpeed: user.harvestSpeed,
            attackSpeed: user.attackSpeed,
            displayHand: user.displayHand,
            structureHand: user.structureHand,
            swingAngle: user.swingAngle,
            attackFlash: user.attackFlash,
        };

        if (user.health <= 0 || user.dead) { // check if client has died
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
        const user = serverState.users.user[socket.id];
        if (user.inventory[data.item] && gameItems[data.item].consumable) { // check if inventory item exists
            gameItems[data.item].consumeFunction(user);
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
                serverState.structures.structure[structure.structureID] = structure;
                serverState.structures.structureData[structure.structureID] = structure.structureDataPackage();
                gameItems[data.type].consumeFunction(serverState.users.user[socket.id]);
            }
        }
    });

    socket.on('swing', data => {
        let user = serverState.users.user[socket.id];
        user.swingRequest = data.swing;
    });    

    socket.on('harvest', data => {
        // subtract the amount harvested from the resource
        serverState.resources.resource[data.resourceID].harvest(data.amount);
        // add the amount harvested to the clients resource pile
        serverState.users.user[socket.id].harvest(serverState.resources.resource[data.resourceID].type, data.amount);

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
        let entity = serverState.entities.entity[data.entityID];
        entity.attacked(serverState.users.user[data.id].damage, serverState.users.user[data.id]);

        /* if the entity was killed */
        if (entity.killed()) {
            // add the amount harvested from kill to client inventory
            serverState.users.user[socket.id].kill(entity.loot);
            io.emit('killed', {
                collisionX: data.collisionX,
                collisionY: data.collisionY,
                entityID: data.entityID,
            });

            if (entity.homeAreaID && entity.homeAreaID !== 'map') { // if entity had a home area and it isn't the map, decrease areas entity amount
                serverState.areas.area[entity.homeAreaID].entityCount--;
            }

            socket.emit('inventoryUpdate', serverState.users.userData[socket.id].inventory) // update the clients inventory
            delete serverState.entities.entity[entityState.entityID];
            delete serverState.entities.entityData[entityData.entityID];
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

    socket.on('dropItem', data => {
        serverState.users.user[socket.id].drop(data.type, data.amount, serverState);
    });

    socket.on('clientLootCrate', data => {
        serverState.users.user[socket.id].lootCrate(serverState, data.crateID)
    });

    // when disconnected, remove user from server state
    socket.on('disconnect', () => {
        serverState.users.user[socket.id].dead = true;
        socket.broadcast.emit('userLeave', socket.id);
        for (let [structureID, structure] of Object.entries(serverState.structures.structure)) {
            if (structure.parentID === socket.id) {
                serverState.structures.structure[structureID].destroyed(CreateMap, serverState);
                delete serverState.structures.structureData[structureID]; // delete structures that were created by the client
            }
        }
        serverState.users.user[socket.id].die(CreateMap, serverState);
        delete serverState.users.user[socket.id]; // delete client data
        delete serverState.users.userData[socket.id];
    });
})

function update(serverState) {
    // serverState.timeTick ++;
    if (serverState.timeTick > 10000) {
        serverState.timeTick = 0; // reset to day
    }

    // update server states, and some server states, like structures and resources, don't need to be updated. may change
    for (let user of Object.values(serverState.users.user)) {
        user.update(serverState, map, io);
    }
    for (let entity of Object.values(serverState.entities.entity)) {
        entity.update(serverState, map, io);
    }
    for (let crate of Object.values(serverState.crates.crate)) {
        crate.update(serverState);
    }
    for (let structure of Object.values(serverState.structures.structure)) {
        structure.update(serverState, CreateMap, io);
    }
    for (let area of Object.values(serverState.areas.area)) {
        area.update(serverState, CreateMap);
    }

    // emit data (perhaps combine all into one later)
    io.sockets.emit('userStates', serverState.users.userData);
    io.sockets.emit('crateStates', serverState.crates.crateData);
    io.sockets.emit('structureStates', serverState.structures.structureData);
    io.sockets.emit('resourceStates', serverState.resources.resourceData);
    io.sockets.emit('entityStates', serverState.entities.entityData);
    io.sockets.emit('areaStates', serverState.areas.areaData);
    io.sockets.emit('timeTick', serverState.timeTick);

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