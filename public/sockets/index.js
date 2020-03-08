import { clientState, player, stage, } from "../app.js";


import { clientUpdate } from "./player/clientUpdate.js";
import { leaderboardUpdate } from "./UI/leaderboardUpdate.js";
import { craftableItemsUpdate } from "./UI/craftableItemsUpdate.js";

import { enemyUpdate } from "./clientState/enemies/enemyUpdate.js";
import { resourceUpdate } from "./clientState/resources/resourceUpdate.js";
import { entityUpdate } from "./clientState/entities/entityUpdate.js";
import { structureUpdate } from "./clientState/structures/structureUpdate.js";
import { crateUpdate } from "./clientState/crates/crateUpdate.js";
import { areaUpdate } from "./clientState/areas/areaUpdate.js";
import { timeTick } from "./clientState/timeTick/timeTick.js";

export function clientInit(socket) {
    socket.emit('nickname', window.localStorage.getItem('nickname'));
    socket.on('playerInit', initData => {
        player.inventoryUpdate(initData.inventory);
        player.toolTier = initData.toolTier;

        // create boundary borders
        clientState.resize(initData.mapSize, stage);
        clientState.render(stage);
        clientState.timeInit(initData.dayTimeLength, initData.timeTick, stage);
        // when other init data is created, add here
    });
}

export function socketUpdate(socket) {
    // update client data
    clientUpdate(socket);

    // update client state
    enemyUpdate(socket, clientState);
    resourceUpdate(socket, clientState);
    entityUpdate(socket, clientState);
    crateUpdate(socket, clientState);
    structureUpdate(socket, clientState);
    areaUpdate(socket, clientState);
    timeTick(socket, clientState);

    // update UI data
    leaderboardUpdate(socket, clientState.leaderboardState);
    craftableItemsUpdate(socket, clientState.craftableItemsState);
}