import { player, boundary } from "../../app";
import { Player } from "../../gameClasses/player";

export const clientDataUpdate = (socket) => {
    // update the client inventory, specifically made so react will display the amount of resources the player has
    socket.on('clientDataUpdate', data => {

        player.inventoryUpdate(data.inventory);
        player.healthUpdate(data.health);
        player.hungerUpdate(data.hunger);

        player.toolUpdate(data.toolTier);

        Player.createHandSprites(player.handSprites, player.x, player.y, data.toolTier);

        player.attackSpeed = data.attackSpeed;
        player.harvestSpeed = data.harvestSpeed;

        player.effects = data.effects;

        player.swingAngle = data.swingAngle;

        // player.displayHand = data.displayHand;
        if (player.structureHand) {
            player.structureBuilding(data.structureHand);
        }

        player.globalX = data.globalX;
        player.globalY = data.globalY;
        
        player.craftingState = data.craftingState;
        player.score = data.score;
        if (data.dead) {
            player.died();
        };
    })
};