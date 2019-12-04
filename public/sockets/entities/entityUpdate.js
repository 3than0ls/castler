import { Entity } from "../../gameClasses/entity";

export const entityUpdate = (socket, clientState) => {
    socket.on('attacked', data => {
        clientState.entities[data.entityID].hit(data.vx, data.vy, data.collisionX, data.collisionY, data.attackSpeed);
    });
    socket.on('entityStates', serverStateEntities => {
        const entityIDs = Object.keys(serverStateEntities);
        for(let i = 0; i < entityIDs.length; i++) {
            // if new resource found, add it
            if (!clientState.entities[entityIDs[i]]) {
                // if new id and info found, create new resource and add it to client state
                let data = serverStateEntities[entityIDs[i]];
                const newEntity = new Entity(data.entityID, data.type, data.nuetrality, data.amount, data.globalX, data.globalY);
                newEntity.render(); // render resource
                clientState.entities[entityIDs[i]] = newEntity;
            }
            
            let data = serverStateEntities[entityIDs[i]];
            clientState.entities[entityIDs[i]].animate(
                data.globalX, data.globalY, data.angle, data.nuetrality
            );
        }
        /*
        // delete disconnected players
        const enemyIDs = Object.keys(clientState.enemies);
        // filters server ids from client ids, and if theres a difference remove it
        let userDifference = enemyIDs.filter(function(i) {return userIDs.indexOf(i) < 0; }); 
        for(let i = 0; i < userDifference.length; i++) {
            clientState.enemies[userDifference[i]].delete();
            delete clientState.enemies[userDifference[i]];
        }*/
    });
};
