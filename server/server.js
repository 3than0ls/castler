/*
    TO DO:
    ISSUES: 
    when transitioning from night to day with hourglass, renderering filter fails to work
    resizing does not work when dead
    
    BIG:
    create walking particle
    make entities fade in when spawning <--- NEXT
    update game without webworkers, see if this is possible <---- NEXT

    SMALL:
    more different resources, areas, entities, weapons,
    create official favicon

    CODE CLEANING:
        - transfer EVERY config (entity data, resource data, weapon stats, armor stats) to config files into gameConfigs, and eliminate all need for switch statements
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

const ServerStates = require('./serverStates/index');
const serverState = new ServerStates();
serverState.test2();

const gameItems = require('./gameConfigs/items.js');

io.on('connection', socket => {
    serverState.createUser(socket.id);

    socket.emit('connected');

    // initial variable assignments
    socket.on('nickname', nickname => {
        serverState.users.user[socket.id].nickname = nickname;
    }); // update the server info of the clients nickname when client connects

    socket.emit('playerInit', {
        // mapSize: map.size,
        mapSize: serverState.size,
        inventory: serverState.users.user[socket.id].inventory,
        toolTier: serverState.users.user[socket.id].toolTier,
        dayTimeLength: serverState.dayTimeLength,
        timeTick: serverState.timeTick,
    }) // provide the connecting client information it needs when it first connects

    socket.on('clientState', data => {
        if (!serverState.users.user[data.id]) {
            socket.emit('refresh');
        } else {
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
                attackFlash: user.attackFlash,
                swingAngle: user.swingAngle,
            };
    
            if (user.health <= 0 || user.dead) { // check if client has died
                socket.emit('clientDied');
            }
            // user.playerTick(); // tick player
    
            let items = user.craftableItems(gameItems, serverState);
            if (items) {
                socket.emit('craftableItemsUpdate', items);
            }
    
            socket.emit('clientDataUpdate', clientUpdateData);
        }
    });

    socket.on('clientRequestCraft', data => {
        if (gameItems[data.item]) { // check if item exists
            serverState.users.user[socket.id].craft(gameItems[data.item], serverState.users.user[socket.id]);
        }
    });

    socket.on('clientRequestConsume', data => {
        const user = serverState.users.user[socket.id];
        if (user.inventory[data.item] && gameItems[data.item].consumable) { // check if inventory item exists
            gameItems[data.item].consumeFunction(user, serverState);
        }
    });

    socket.on('clientCreateStructure', data => {
        if (serverState.users.user[socket.id].inventory[data.type]) { // test if inventory item exists
            if (serverState.users.user[socket.id].inventory[data.type].amount > 0) {
                // need to test if structure type exists
                serverState.createStructures(1, data.globalX, data.globalY, data.globalX, data.globalY, {type: data.type}, socket.id);
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
                serverState.structures.structure[structureID].destroyed(serverState);
                delete serverState.structures.structure[structureID];
                delete serverState.structures.structureData[structureID]; // delete structures that were created by the client
            }
        }
        serverState.users.user[socket.id].die(serverState);
        delete serverState.users.user[socket.id]; // delete client data
        delete serverState.users.userData[socket.id];
    });
});

function update(serverState) {
    serverState.update(io);

    // update server states, and some server states, like structures and resources, don't need to be updated. may change
    for (let user of Object.values(serverState.users.user)) {
        user.update(serverState, io);
    }
    for (let entity of Object.values(serverState.entities.entity)) {
        entity.update(serverState, io);
    }
    for (let crate of Object.values(serverState.crates.crate)) {
        crate.update(serverState);
    }
    for (let structure of Object.values(serverState.structures.structure)) {
        structure.update(serverState, io);
    }
    for (let area of Object.values(serverState.areas.area)) {
        area.update(serverState);
    }

    // emit data (perhaps combine all into one later)
    io.sockets.emit('enemyStates', serverState.users.userData);
    io.sockets.emit('crateStates', serverState.crates.crateData);
    io.sockets.emit('structureStates', serverState.structures.structureData);
    io.sockets.emit('resourceStates', serverState.resources.resourceData);
    io.sockets.emit('entityStates', serverState.entities.entityData);
    io.sockets.emit('areaStates', serverState.areas.areaData);
    io.sockets.emit('timeTick', serverState.timeTick);

    // emit leaderboard status (based on player score)
    serverState.leaderboardUpdate();
    
    io.sockets.emit('leaderboardUpdate', serverState.leaderboardState);
};

http.listen(3000, () => {
    setInterval(() => {
        // console.time('update');
        update(serverState);
        // console.timeEnd('update');
    }, 1000/60);    

    console.log('listening on localhost:3000');
});