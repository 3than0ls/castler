import { player } from "../../game";


export const inventoryUpdate = socket => {
    // update the client inventory, specifically made so react will display the amount of resources the player has
    socket.on('inventoryUpdate', resources => {
        player.inventoryUpdate(resources);
    })
};
