import { socket, clientState } from "../game.js";

import { userUpdate } from "./player/userUpdate.js";
import { inventoryUpdate } from "./player/inventoryUpdate.js";
import { resourceUpdate } from "./resources/resourceUpdate.js";
import { entityUpdate } from "./entities/entityUpdate.js";

import { playerInit } from "./player/playerInit.js";

export function clientInit(socket) {
    playerInit(socket);
}

export function socketUpdate(socket) {
    inventoryUpdate(socket);
    userUpdate(socket, clientState);
    resourceUpdate(socket, clientState);
    entityUpdate(socket, clientState);
}