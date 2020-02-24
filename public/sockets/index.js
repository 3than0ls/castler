import { clientState, player, boundary, leaderboardState, craftableItemsState } from "../app.js";

import { leaderboardUpdate } from "./UI/leaderboardUpdate.js";
import { craftableItemsUpdate } from "./UI/craftableItemsUpdate.js";

import { userUpdate } from "./player/userUpdate.js";
import { resourceUpdate } from "./resources/resourceUpdate.js";
import { entityUpdate } from "./entities/entityUpdate.js";
import { structureUpdate } from "./structures/structureUpdate.js";
import { crateUpdate } from "./crates/crateUpdate.js";
import { areaUpdate } from "./areas/areaUpdate.js";
import { clientDataUpdate } from "./player/clientDataUpdate.js";
import { timeTick } from "./timeTick/timeTick.js";

export function clientInit(socket) {
    socket.emit('nickname', window.localStorage.getItem('nickname'));
    socket.on('playerInit', initData => {
        player.inventoryUpdate(initData.inventory);
        player.toolTier = initData.toolTier;

        // create boundary borders
        boundary.resize(initData.mapSize);
        boundary.renderBoundary();
        // when other init data is created, add here
    });
}

export function socketUpdate(socket) {
    // update client data
    clientDataUpdate(socket);
    // update enemy puppet data
    userUpdate(socket, clientState);
    // update resource and entity data
    resourceUpdate(socket, clientState);
    entityUpdate(socket, clientState);
    // update crates
    crateUpdate(socket, clientState);
    // update areas (may remove) and structures
    structureUpdate(socket, clientState);
    areaUpdate(socket, clientState);
    // update UI data
    // update leaderboard data
    leaderboardUpdate(socket, leaderboardState);
    // update craftable items data
    craftableItemsUpdate(socket, craftableItemsState)
    // update time cycle
    timeTick(socket, clientState);
}