import { player } from "../../app";

export const clientDataUpdate = (socket) => {
    // update the client inventory, specifically made so react will display the amount of resources the player has
    socket.on('clientDataUpdate', data => {
        player.inventoryUpdate(data.inventory);
        player.healthUpdate(data.health);
        player.hungerUpdate(data.hunger);

        player.globalX = data.globalX;
        player.globalY = data.globalY;

        player.craftingState = data.craftingState;
        player.score = data.score;
        if (data.dead) {
            player.died();
        }
    })
};