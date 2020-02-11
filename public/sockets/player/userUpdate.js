import { Enemy } from "../../gameClasses/enemies";
import { Player } from "../../gameClasses/player";


export const userUpdate = (socket, clientState) => {
    socket.on('userStates', serverStateUsers => {
        for (let [userID, serverStateUser] of Object.entries(serverStateUsers)) {
            // if new player found, add it
            if (!clientState.enemies[userID] && userID !== socket.id) { // if not user isnt already found and isn't the client
                // if new id and info found, create new enemy and add it to client state
                const newEnemy = new Enemy(serverStateUser.clientID, -serverStateUser.globalX, -serverStateUser.globalY, serverStateUser.toolTier);
                newEnemy.render(); // render enemy
                clientState.enemies[userID] = newEnemy;
            }
            
            if (userID !== socket.id) { // if the server sent player id isn't the client id
                let enemy = clientState.enemies[userID];
                if (enemy.toolTier !== serverStateUser.toolTier) {
                    Player.createHandSprites(enemy.handSprites, serverStateUser.globalX, serverStateUser.globalY, serverStateUser.toolTier);
                }
                enemy.animate(
                    serverStateUser.globalX, serverStateUser.globalY, serverStateUser.angle, serverStateUser.swingAngle, serverStateUser.displayHand, serverStateUser.toolTier, serverStateUser.effects
                );
                if (serverStateUser.attackFlash) {
                    clientState.enemies[userID].attackFlash();
                }
            }
        }
        // delete disconnected players
        const enemyIDs = Object.keys(clientState.enemies);
        // filters client enemies using server sent data
        let userDifference = enemyIDs.filter(function(enemyID) {
            return !serverStateUsers[enemyID]; // check if client has any enemies that the server doesn't, and if so, filter it to a waste difference array
        }); 
        // delete entities in waste difference array
        for (let i = 0; i < userDifference.length; i++) {
            clientState.enemies[userDifference[i]].delete();
            delete clientState.enemies[userDifference[i]];
        }
    });
};
