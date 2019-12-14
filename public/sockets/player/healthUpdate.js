import { player } from "../../game";

export const healthUpdate = socket => {
    // update the client inventory, specifically made so react will display the amount of resources the player has
    socket.on('healthUpdate', data => {
        player.attacked(data.damage);
    })
};
