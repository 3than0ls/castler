import { player } from "../../game";

export const clientUIUpdate = (socket) => {
    // update the client inventory, specifically made so react will display the amount of resources the player has
    socket.on('clientUIUpdate', data => {
        player.inventoryUpdate(data.inventory);
        player.healthUpdate(data.health);
    })
};