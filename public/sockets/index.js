import { socket, clientState, player } from "../game.js";

import { userUpdate } from "./player/userUpdate.js";
import { inventoryUpdate } from "./player/inventoryUpdate.js";
import { healthUpdate } from "./player/healthUpdate.js";
import { resourceUpdate } from "./resources/resourceUpdate.js";
import { entityUpdate } from "./entities/entityUpdate.js";
import { clientUIUpdate } from "./player/clientUIUpdate.js";

export function clientInit(socket) {
    socket.on('playerInit', initData => {
        player.inventoryUpdate(initData.inventory);
        // when other init data is created, add here
    });
}

export function socketUpdate(socket) {
    /*
    inventoryUpdate(socket);
    healthUpdate(socket);*/
    clientUIUpdate(socket);
    userUpdate(socket, clientState);
    resourceUpdate(socket, clientState);
    entityUpdate(socket, clientState);
}