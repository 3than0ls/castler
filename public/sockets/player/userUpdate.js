import { Enemy } from "../../gameClasses/enemies";
import { player, animate } from "../../app";
import { Player } from "../../gameClasses/player";


export const userUpdate = (socket, clientState) => {
    socket.on('userStates', serverStateUsers => {
        const userIDs = Object.keys(serverStateUsers);
        for(let i = 0; i < userIDs.length; i++) {
            // if new player found, add it
            if (!clientState.enemies[userIDs[i]] && userIDs[i] !== socket.id) { // if not user isnt already found and isn't the client
                // if new id and info found, create new enemy and add it to client state
                let data = serverStateUsers[userIDs[i]];
                const newEnemy = new Enemy(data.clientID, -data.globalX, -data.globalY, data.toolTier);
                newEnemy.render(); // render enemy
                clientState.enemies[userIDs[i]] = newEnemy;
            }
            
            if (userIDs[i] !== socket.id) { // if the server sent player id isn't the client id
                let data = serverStateUsers[userIDs[i]];
                let enemy = clientState.enemies[userIDs[i]];
                enemy.animate(
                    data.globalX, data.globalY, data.angle, data.swingAngle, data.displayHand
                );
                if (enemy.toolTier !== data.toolTier) {
                    Player.createHandSprites(enemy.handSprites, data.globalX, data.globalY, data.toolTier);
                }
                if (data.attackFlash) {
                    clientState.enemies[userIDs[i]].attackFlash();
                }
            }
        }
        // delete disconnected players
        const enemyIDs = Object.keys(clientState.enemies);
        // filters server ids from client ids, and if theres a difference remove it
        let userDifference = enemyIDs.filter(function(i) {return userIDs.indexOf(i) < 0; }); 
        for(let i = 0; i < userDifference.length; i++) {
            clientState.enemies[userDifference[i]].delete();
            delete clientState.enemies[userDifference[i]];
        }
    });
};
