import { clientState, player } from "../app.js";
import { leaderboardState } from "../UI/leaderboard/leaderboard.js";

import { userUpdate } from "./player/userUpdate.js";
import { resourceUpdate } from "./resources/resourceUpdate.js";
import { entityUpdate } from "./entities/entityUpdate.js";
import { clientDataUpdate } from "./player/clientDataUpdate.js";
import { leaderboardUpdate } from "./leaderboard/leaderboardUpdate.js";

export function clientInit(socket) {
    socket.emit('nickname', window.localStorage.getItem('nickname'));
    socket.on('playerInit', initData => {
        player.inventoryUpdate(initData.inventory);
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
    // update leaderboard data
    leaderboardUpdate(socket, leaderboardState);
}