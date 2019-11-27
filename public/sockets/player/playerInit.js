import { player } from "../../game";

export const playerInit = socket => {
    socket.on('playerInit', initData => {
        player.inventoryUpdate(initData.resources);
        // when other init data is created, add here
    })
}