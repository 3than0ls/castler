import { clientState, player } from "../game.js";

import { userUpdate } from "./player/userUpdate.js";
import { resourceUpdate } from "./resources/resourceUpdate.js";
import { entityUpdate } from "./entities/entityUpdate.js";
import { clientDataUpdate } from "./player/clientDataUpdate.js";

export function clientInit(socket) {
    socket.on('playerInit', initData => {
        player.inventoryUpdate(initData.inventory);
        // when other init data is created, add here
    });
}

export function socketUpdate(socket) {
    clientDataUpdate(socket);
    userUpdate(socket, clientState);
    resourceUpdate(socket, clientState);
    entityUpdate(socket, clientState);
}