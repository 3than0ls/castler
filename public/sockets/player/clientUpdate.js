import { player } from "../../app";
import { renderDeathMenu } from "../../UI/death/menu";

export const clientUpdate = (socket) => {
    // update the client inventory, specifically made so react will display the amount of resources the player has
    socket.on('clientDied', () => {
        player.died();
        renderDeathMenu();
    });
    socket.on('clientDataUpdate', data => {
        player.attackFlash = data.attackFlash;
        
        player.inventoryUpdate(data.inventory);
        player.healthUpdate(data.health);
        player.hungerUpdate(data.hunger);

        player.tierUpdate(data.toolTier, data.armorTier);

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
    })
};